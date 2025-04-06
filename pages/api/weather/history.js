import { getFirestore } from 'firebase-admin/firestore';
import { getWeatherData } from '../../../lib/weather';
import { auth } from 'firebase-admin';
import { initAdmin } from '../../../lib/firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized
initAdmin();

// Get Firestore instance
const adminDb = getFirestore();

export default async function handler(req, res) {
  const { method } = req;

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

    switch (method) {
      case 'GET':
        try {
          const snapshot = await adminDb
            .collection('weatherHistory')
            .where('userId', '==', userId)
            .get();

          const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          res.status(200).json(history);
        } catch (error) {
          console.error('Error fetching history:', error);
          res.status(500).json({ error: 'Failed to fetch weather history' });
        }
        break;

      case 'POST':
        try {
          const { location, startDate, endDate } = req.body;

          // Validate dates
          const start = new Date(startDate);
          const end = new Date(endDate);
          const today = new Date();

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
          }

          if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date' });
          }

          if (end > today) {
            return res.status(400).json({ error: 'End date cannot be in the future' });
          }

          // Validate location by attempting to fetch weather data
          const weatherData = await getWeatherData(location);
          if (!weatherData?.current?.main?.temp) {
            return res.status(400).json({ error: 'Could not fetch temperature data for this location' });
          }

          const averageTemp = Math.round(weatherData.current.main.temp * 10) / 10;

          const docRef = await adminDb.collection('weatherHistory').add({
            userId,
            location,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            averageTemp,
            createdAt: new Date().toISOString()
          });

          const newDoc = await docRef.get();
          res.status(201).json({ 
            id: docRef.id,
            ...newDoc.data()
          });
        } catch (error) {
          console.error('Error saving history:', error);
          res.status(500).json({ error: error.message || 'Failed to save weather history' });
        }
        break;

      case 'PUT':
        try {
          const { id } = req.query;
          const { location, startDate, endDate } = req.body;

          // Verify ownership
          const docRef = adminDb.collection('weatherHistory').doc(id);
          const docSnap = await docRef.get();
          
          if (!docSnap.exists || docSnap.data().userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this record' });
          }

          // Rest of validation...
          if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            const today = new Date();

            if (start && end && start > end) {
              return res.status(400).json({ error: 'Start date must be before end date' });
            }

            if (end && end > today) {
              return res.status(400).json({ error: 'End date cannot be in the future' });
            }
          }

          if (location) {
            const weatherData = await getWeatherData(location);
            if (!weatherData?.current?.main?.temp) {
              return res.status(400).json({ error: 'Could not fetch temperature data for this location' });
            }
          }

          const updateData = {
            ...(location && { location }),
            ...(startDate && { startDate: new Date(startDate).toISOString() }),
            ...(endDate && { endDate: new Date(endDate).toISOString() }),
            updatedAt: new Date().toISOString()
          };

          await docRef.update(updateData);
          
          const updatedDoc = await docRef.get();
          res.status(200).json({ 
            id: docRef.id,
            ...updatedDoc.data()
          });
        } catch (error) {
          console.error('Error updating history:', error);
          res.status(500).json({ error: error.message || 'Failed to update weather history' });
        }
        break;

      case 'DELETE':
        try {
          const { id } = req.query;
          const docRef = adminDb.collection('weatherHistory').doc(id);
          
          // Verify ownership
          const docSnap = await docRef.get();
          if (!docSnap.exists || docSnap.data().userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this record' });
          }

          await docRef.delete();
          res.status(200).json({ success: true });
        } catch (error) {
          console.error('Error deleting history:', error);
          res.status(500).json({ error: 'Failed to delete weather history' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
} 