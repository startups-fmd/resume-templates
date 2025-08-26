export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      message: 'Auth endpoint working!',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
