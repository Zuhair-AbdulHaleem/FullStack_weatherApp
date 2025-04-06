import { getFirestore } from 'firebase-admin/firestore';
import { auth } from 'firebase-admin';
import { initAdmin } from '../../../../lib/firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized
initAdmin();

// Get Firestore instance
const adminDb = getFirestore();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    // Verify the token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get the document reference
    const docRef = adminDb.collection('weatherHistory').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Verify ownership
    if (docSnap.data().userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this record' });
    }

    switch (method) {
      case 'GET':
        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
        break;

      case 'PUT':
        try {
          const { location, startDate, endDate } = req.body;

          const updateData = {
            ...(location && { location }),
            ...(startDate && { startDate: new Date(startDate).toISOString() }),
            ...(endDate && { endDate: new Date(endDate).toISOString() }),
            updatedAt: new Date().toISOString()
          };

          await docRef.update(updateData);
          const updatedDoc = await docRef.get();
          res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
        } catch (error) {
          console.error('Error updating history:', error);
          res.status(500).json({ error: error.message || 'Failed to update weather history' });
        }
        break;

      case 'DELETE':
        try {
          await docRef.delete();
          res.status(200).json({ success: true });
        } catch (error) {
          console.error('Error deleting history:', error);
          res.status(500).json({ error: 'Failed to delete weather history' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
} 