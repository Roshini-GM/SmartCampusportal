import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Safely parses and formats a MongoDB connection string.
 * Handles common user mistakes like:
 * - Leaving angle brackets from Atlas instructions: <username> or <password>
 * - Passwords with unencoded special characters like '@', '#', '%', etc.
 * - Missing default database name
 */
export function formatMongoUri(rawUri?: string): string {
  if (!rawUri || typeof rawUri !== 'string') {
    return '';
  }

  const trimmed = rawUri.trim();

  // If already standard URI without multiple @ or angle brackets
  if (!trimmed.includes('<') && !trimmed.includes('>') && (trimmed.match(/@/g) || []).length <= 1) {
    // Ensure database name exists if ending with /
    if (trimmed.endsWith('/')) {
      return `${trimmed}smart_campus?retryWrites=true&w=majority`;
    }
    return trimmed;
  }

  try {
    const isSrv = trimmed.startsWith('mongodb+srv://');
    const prefix = isSrv ? 'mongodb+srv://' : 'mongodb://';
    const withoutPrefix = trimmed.slice(prefix.length);

    // The last '@' sign separates credentials from cluster host
    const lastAtIndex = withoutPrefix.lastIndexOf('@');
    if (lastAtIndex === -1) {
      return trimmed;
    }

    const credPart = withoutPrefix.slice(0, lastAtIndex);
    let hostPart = withoutPrefix.slice(lastAtIndex + 1);

    const firstColonIndex = credPart.indexOf(':');
    if (firstColonIndex === -1) {
      return trimmed;
    }

    let username = credPart.slice(0, firstColonIndex);
    let password = credPart.slice(firstColonIndex + 1);

    // Strip leading '<' and trailing '>' if left from Atlas template
    username = username.replace(/^</, '').replace(/>$/, '').trim();
    password = password.replace(/^</, '').replace(/>$/, '').trim();

    // Check if hostPart already has a database path
    let dbAndParams = '';
    const slashIndex = hostPart.indexOf('/');
    if (slashIndex === -1) {
      hostPart = `${hostPart}/smart_campus?retryWrites=true&w=majority`;
    } else {
      const dbPath = hostPart.slice(slashIndex + 1);
      if (!dbPath || dbPath.startsWith('?')) {
        hostPart = `${hostPart.slice(0, slashIndex)}/smart_campus${dbPath.startsWith('?') ? dbPath : '?retryWrites=true&w=majority'}`;
      }
    }

    const safeUri = `${prefix}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostPart}`;
    return safeUri;
  } catch (err) {
    console.warn('[MongoDB URI Sanitizer] Fallback to raw URI:', err);
    return trimmed;
  }
}

export interface DBStatus {
  connected: boolean;
  connecting: boolean;
  database: string;
  error?: string;
  egressIp?: string;
}

let dbStatus: DBStatus = {
  connected: false,
  connecting: false,
  database: 'smart_campus',
};

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<boolean> {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    console.warn('[MongoDB] MONGODB_URI environment variable is not defined.');
    dbStatus = {
      connected: false,
      connecting: false,
      database: 'none',
      error: 'MONGODB_URI secret is not configured in environment variables.',
    };
    return false;
  }

  const formattedUri = formatMongoUri(rawUri);

  if (mongoose.connection.readyState === 1) {
    dbStatus.connected = true;
    dbStatus.connecting = false;
    return true;
  }

  dbStatus.connecting = true;
  dbStatus.error = undefined;

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
    
    // Connection options for resilient MongoDB Atlas connectivity
    await mongoose.connect(formattedUri, {
      serverSelectionTimeoutMS: 7000,
      connectTimeoutMS: 7000,
      family: 4, // Force IPv4
    });

    dbStatus = {
      connected: true,
      connecting: false,
      database: mongoose.connection.name || 'smart_campus',
    };

    console.log(`[MongoDB] Successfully connected to MongoDB Atlas! Database: "${dbStatus.database}"`);
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error('[MongoDB] Connection error:', errorMsg);

    let advice = errorMsg;
    if (errorMsg.includes('whitelist') || errorMsg.includes('SSL alert number 80') || errorMsg.includes('ReplicaSetNoPrimary')) {
      advice = 'IP Address not whitelisted on MongoDB Atlas. Please add "0.0.0.0/0" (Allow Access from Anywhere) in MongoDB Atlas -> Network Access -> IP Access List.';
    }

    dbStatus = {
      connected: false,
      connecting: false,
      database: 'smart_campus',
      error: advice,
    };

    return false;
  }
}

export function getDBStatus(): DBStatus {
  return {
    ...dbStatus,
    connected: mongoose.connection.readyState === 1,
  };
}

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from MongoDB Atlas');
  dbStatus.connected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to MongoDB Atlas');
  dbStatus.connected = true;
  dbStatus.error = undefined;
});
