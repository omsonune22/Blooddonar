import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Data Store with rich initial dataset
let donors = [
  {
    id: 'd1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    bloodGroup: 'O-',
    location: 'Central City, NY',
    city: 'Central City',
    address: '450 Mercy Avenue, Suite 12',
    dateOfBirth: '1992-05-14',
    availability: 'Available',
    lastDonationDate: '2026-04-12',
    totalDonations: 14,
    verificationStatus: 'Verified',
    distanceKm: 1.8,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bio: 'Emergency medicine practitioner & regular universal donor. Ready to respond 24/7 for urgent cases.'
  },
  {
    id: 'd2',
    name: 'Michael Chang',
    email: 'm.chang@example.com',
    phone: '+1 (555) 876-5432',
    bloodGroup: 'A+',
    location: 'Metro Ridge, NY',
    city: 'Metro Ridge',
    address: '88 Tech Boulevard',
    dateOfBirth: '1995-11-20',
    availability: 'Available',
    lastDonationDate: '2026-06-01',
    totalDonations: 8,
    verificationStatus: 'Verified',
    distanceKm: 3.4,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Software developer and plasma donor. Available on weekends and emergency evenings.'
  },
  {
    id: 'd3',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    phone: '+1 (555) 345-6789',
    bloodGroup: 'B+',
    location: 'Central City, NY',
    city: 'Central City',
    address: '102 Greenfield Park',
    dateOfBirth: '1998-03-08',
    availability: 'Busy',
    lastDonationDate: '2026-07-20',
    totalDonations: 5,
    verificationStatus: 'Verified',
    distanceKm: 4.1,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bio: 'Certified nurse. Recently donated, available for emergencies next month.'
  },
  {
    id: 'd4',
    name: 'David Miller',
    email: 'david.m@example.com',
    phone: '+1 (555) 901-2345',
    bloodGroup: 'AB+',
    location: 'Westside, NY',
    city: 'Westside',
    address: '77 Ocean Drive',
    dateOfBirth: '1990-09-15',
    availability: 'Available',
    lastDonationDate: '2026-03-10',
    totalDonations: 19,
    verificationStatus: 'Verified',
    distanceKm: 6.2,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Universal recipient, frequent platelet donor. Passionate about community health.'
  },
  {
    id: 'd5',
    name: 'Aisha Patel',
    email: 'aisha.p@example.com',
    phone: '+1 (555) 432-1098',
    bloodGroup: 'O+',
    location: 'Central City, NY',
    city: 'Central City',
    address: '15 Harmony Lane',
    dateOfBirth: '1996-07-22',
    availability: 'Available',
    lastDonationDate: '2026-05-30',
    totalDonations: 11,
    verificationStatus: 'Verified',
    distanceKm: 2.1,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    bio: 'High school teacher & active blood drive coordinator.'
  },
  {
    id: 'd6',
    name: 'Robert Vance',
    email: 'robert.v@example.com',
    phone: '+1 (555) 678-9012',
    bloodGroup: 'AB-',
    location: 'Metro Ridge, NY',
    city: 'Metro Ridge',
    address: '304 Highland Ave',
    dateOfBirth: '1988-02-18',
    availability: 'Available',
    lastDonationDate: '2026-02-14',
    totalDonations: 22,
    verificationStatus: 'Verified',
    distanceKm: 5.5,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Rare blood group donor. Always willing to travel for critical surgical requests.'
  }
];

let requests = [
  {
    id: 'req-101',
    patientName: 'Arthur Pendelton',
    bloodGroup: 'O-',
    hospitalName: 'St. Jude Memorial Hospital',
    location: 'Central City, NY',
    unitsRequired: 3,
    requiredDate: '2026-08-10',
    emergencyStatus: 'Critical',
    additionalMessage: 'Urgent cardiac bypass surgery scheduled for 8:00 AM tomorrow. Rare O- negative donors needed urgently.',
    status: 'Active',
    createdAt: '2026-08-09T18:00:00.000Z',
    contactPhone: '+1 (555) 987-1234',
    responsesCount: 4
  },
  {
    id: 'req-102',
    patientName: 'Samantha Reed',
    bloodGroup: 'A+',
    hospitalName: 'City General Trauma Center',
    location: 'Metro Ridge, NY',
    unitsRequired: 2,
    requiredDate: '2026-08-11',
    emergencyStatus: 'Urgent',
    additionalMessage: 'Post-accident recovery requires 2 units of A+ packed red cells.',
    status: 'Pending',
    createdAt: '2026-08-09T14:30:00.000Z',
    contactPhone: '+1 (555) 876-0011',
    responsesCount: 2
  },
  {
    id: 'req-103',
    patientName: 'Lucas Morales',
    bloodGroup: 'B+',
    hospitalName: 'Children Health Institute',
    location: 'Central City, NY',
    unitsRequired: 1,
    requiredDate: '2026-08-08',
    emergencyStatus: 'Standard',
    additionalMessage: 'Platelet transfusion for pediatric oncology therapy.',
    status: 'Completed',
    createdAt: '2026-08-07T10:15:00.000Z',
    contactPhone: '+1 (555) 765-4321',
    responsesCount: 5
  }
];

let messages = [
  {
    id: 'm1',
    conversationId: 'c-d1',
    senderId: 'user-me',
    receiverId: 'd1',
    donorName: 'Dr. Sarah Jenkins',
    donorPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O-',
    text: 'Hello Dr. Sarah, we have an urgent request at St. Jude Hospital for O- blood. Are you available today?',
    timestamp: '2026-08-09T19:30:00Z',
    sender: 'user',
    online: true
  },
  {
    id: 'm2',
    conversationId: 'c-d1',
    senderId: 'd1',
    receiverId: 'user-me',
    donorName: 'Dr. Sarah Jenkins',
    donorPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O-',
    text: 'Yes! I can reach St. Jude in approximately 25 minutes. Please notify the triage unit.',
    timestamp: '2026-08-09T19:32:00Z',
    sender: 'donor',
    online: true
  }
];

// API Routes
app.get('/api/donors', (req, res) => {
  const { bloodGroup, city, availability, maxDistance } = req.query;
  let filtered = [...donors];

  if (bloodGroup && bloodGroup !== 'All') {
    filtered = filtered.filter(d => d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
  }

  if (city) {
    filtered = filtered.filter(d => d.city.toLowerCase().includes(city.toLowerCase()) || d.location.toLowerCase().includes(city.toLowerCase()));
  }

  if (availability && availability !== 'All') {
    filtered = filtered.filter(d => d.availability.toLowerCase() === availability.toLowerCase());
  }

  if (maxDistance) {
    filtered = filtered.filter(d => d.distanceKm <= parseFloat(maxDistance));
  }

  res.json({ success: true, count: filtered.length, donors: filtered });
});

app.get('/api/donors/:id', (req, res) => {
  const donor = donors.find(d => d.id === req.params.id);
  if (!donor) {
    return res.status(404).json({ success: false, message: 'Donor not found' });
  }
  res.json({ success: true, donor });
});

app.post('/api/donors', (req, res) => {
  const newDonor = {
    id: 'd-' + Date.now(),
    ...req.body,
    verificationStatus: 'Verified',
    totalDonations: 0,
    distanceKm: (Math.random() * 5 + 0.5).toFixed(1),
    photoUrl: req.body.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  };
  donors.unshift(newDonor);
  res.status(201).json({ success: true, donor: newDonor });
});

app.get('/api/requests', (req, res) => {
  const { status, bloodGroup } = req.query;
  let filtered = [...requests];

  if (status && status !== 'All') {
    filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  if (bloodGroup && bloodGroup !== 'All') {
    filtered = filtered.filter(r => r.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
  }

  res.json({ success: true, count: filtered.length, requests: filtered });
});

app.post('/api/requests', (req, res) => {
  const newRequest = {
    id: 'req-' + Date.now(),
    ...req.body,
    status: 'Active',
    createdAt: new Date().toISOString(),
    responsesCount: 0
  };
  requests.unshift(newRequest);
  res.status(201).json({ success: true, request: newRequest });
});

app.patch('/api/requests/:id', (req, res) => {
  const requestIndex = requests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  requests[requestIndex] = { ...requests[requestIndex], ...req.body };
  res.json({ success: true, request: requests[requestIndex] });
});

app.get('/api/messages', (req, res) => {
  res.json({ success: true, messages });
});

app.post('/api/messages', (req, res) => {
  const newMsg = {
    id: 'm-' + Date.now(),
    timestamp: new Date().toISOString(),
    ...req.body
  };
  messages.push(newMsg);
  res.status(201).json({ success: true, message: newMsg });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      registeredDonors: donors.length + 1240,
      livesSaved: 3820,
      activeRequests: requests.filter(r => r.status === 'Active').length + 18,
      citiesCovered: 45
    }
  });
});

app.post('/api/contact', (req, res) => {
  res.json({ success: true, message: 'Thank you for reaching out! Our team will respond shortly.' });
});

app.listen(PORT, () => {
  console.log(`Local Blood Donor Finder API Server running on port ${PORT}`);
});
