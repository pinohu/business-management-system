export default function handler(req, res) {
  if (req.method === 'GET') {
    // In a real app, this would fetch from a database
    const data = {
      income: [],
      expenses: [],
    };
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { type, data } = req.body;
    // In a real app, this would save to a database
    res.status(200).json({ success: true, message: `${type} data saved` });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 