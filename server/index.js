import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Data Store with Maharashtra, India dataset
let donors = [
  {
    id: 'd1',
    name: 'Dr. Minakshi Pawar',
    email: 'minakshi.pawar@example.com',
    phone: '+91 98230 12345',
    bloodGroup: 'O+',
    city: 'Chhatrapati Sambhajinagar',
    area: 'CIDCO',
    location: 'CIDCO, Chhatrapati Sambhajinagar, Maharashtra',
    hospital: 'Cigma Hospital',
    dateOfBirth: '1992-05-14',
    availability: 'Available Now',
    lastDonationDate: '2026-04-12',
    totalDonations: 14,
    verificationStatus: 'Verified',
    sampleDistanceKm: 2.5,
    distanceKm: 2.5,
    lat: 19.8762,
    lon: 75.3633,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bio: 'Emergency medicine practitioner and universal donor. Available to respond for urgent cases in Chhatrapati Sambhajinagar.'
  },
  {
    id: 'd2',
    name: 'Rahul Deshmukh',
    email: 'rahul.deshmukh@example.com',
    phone: '+91 98220 54321',
    bloodGroup: 'A+',
    city: 'Chhatrapati Sambhajinagar',
    area: 'Garkheda',
    location: 'Garkheda, Chhatrapati Sambhajinagar, Maharashtra',
    hospital: 'MGM Medical Center',
    dateOfBirth: '1995-11-20',
    availability: 'Away',
    lastDonationDate: '2026-02-10',
    totalDonations: 8,
    verificationStatus: 'Verified',
    sampleDistanceKm: 3.1,
    distanceKm: 3.1,
    lat: 19.8580,
    lon: 75.3480,
    photoUrl: '',
    bio: 'Software engineer and dedicated A+ donor in Chhatrapati Sambhajinagar. Available for planned replacement donations.'
  },
  {
    id: 'd3',
    name: 'Priya Patil',
    email: 'priya.patil@example.com',
    phone: '+91 98190 11223',
    bloodGroup: 'B+',
    city: 'Pune',
    area: 'Kothrud',
    location: 'Kothrud, Pune, Maharashtra',
    hospital: 'Deenanath Mangeshkar Hospital',
    dateOfBirth: '1998-03-08',
    availability: 'Available Now',
    lastDonationDate: '2026-03-18',
    totalDonations: 6,
    verificationStatus: 'Verified',
    sampleDistanceKm: 4.2,
    distanceKm: 4.2,
    lat: 18.5074,
    lon: 73.8077,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Healthcare researcher and regular voluntary donor in Pune. Available on short notice in Kothrud area.'
  },
  {
    id: 'd4',
    name: 'Akash Jadhav',
    email: 'akash.jadhav@example.com',
    phone: '+91 98900 33445',
    bloodGroup: 'AB+',
    city: 'Nashik',
    area: 'College Road',
    location: 'College Road, Nashik, Maharashtra',
    hospital: 'Apollo Hospitals Nashik',
    dateOfBirth: '1993-09-15',
    availability: 'Available Now',
    lastDonationDate: '2026-01-28',
    totalDonations: 12,
    verificationStatus: 'Verified',
    sampleDistanceKm: 1.8,
    distanceKm: 1.8,
    lat: 20.0063,
    lon: 73.7634,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Active voluntary blood donor and social worker in Nashik. Ready to support trauma center emergencies.'
  },
  {
    id: 'd5',
    name: 'Sneha Shinde',
    email: 'sneha.shinde@example.com',
    phone: '+91 98234 56789',
    bloodGroup: 'O-',
    city: 'Kolhapur',
    area: 'Rajarampuri',
    location: 'Rajarampuri, Kolhapur, Maharashtra',
    hospital: 'Aster Aadhar Hospital',
    dateOfBirth: '1996-07-22',
    availability: 'Available Now',
    lastDonationDate: '2025-12-05',
    totalDonations: 9,
    verificationStatus: 'Verified',
    sampleDistanceKm: 3.7,
    distanceKm: 3.7,
    lat: 16.6913,
    lon: 74.2433,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    bio: 'Universal O- negative donor. Passionate about rapid response for critical operations across Kolhapur.'
  },
  {
    id: 'd6',
    name: 'Aditya Kulkarni',
    email: 'aditya.kulkarni@example.com',
    phone: '+91 98500 12345',
    bloodGroup: 'B-',
    city: 'Pune',
    area: 'Baner',
    location: 'Baner, Pune, Maharashtra',
    hospital: 'Jupiter Hospital',
    dateOfBirth: '1989-02-18',
    availability: 'Away',
    lastDonationDate: '2025-11-14',
    totalDonations: 11,
    verificationStatus: 'Verified',
    sampleDistanceKm: 5.0,
    distanceKm: 5.0,
    lat: 18.5590,
    lon: 73.7868,
    photoUrl: '',
    bio: 'Rare B- donor based in Baner, Pune. Willing to travel across Pune for pediatric and surgical blood demands.'
  }
];

let requests = [
  {
    id: 'req-101',
    patientName: 'Ramesh Patil',
    bloodGroup: 'O-',
    hospitalName: 'Cigma Hospital',
    location: 'Chhatrapati Sambhajinagar, Maharashtra',
    unitsRequired: 3,
    requiredDate: '2026-08-10',
    emergencyStatus: 'Critical',
    additionalMessage: 'Urgent cardiac bypass surgery scheduled for tomorrow. Rare O- negative donors needed urgently in Maharashtra.',
    status: 'Active',
    createdAt: '2026-08-09T18:00:00.000Z',
    contactPhone: '+91 98220 12345',
    responsesCount: 4
  },
  {
    id: 'req-102',
    patientName: 'Sunita Deshmukh',
    bloodGroup: 'A+',
    hospitalName: 'Ruby Hall Clinic',
    location: 'Pune, Maharashtra',
    unitsRequired: 2,
    requiredDate: '2026-08-11',
    emergencyStatus: 'Urgent',
    additionalMessage: 'Post-accident recovery requires 2 units of A+ packed red cells in Pune.',
    status: 'Pending',
    createdAt: '2026-08-09T14:30:00.000Z',
    contactPhone: '+91 98190 54321',
    responsesCount: 2
  },
  {
    id: 'req-103',
    patientName: 'Aarav Kulkarni',
    bloodGroup: 'B+',
    hospitalName: 'KEM Hospital',
    location: 'Mumbai, Maharashtra',
    unitsRequired: 1,
    requiredDate: '2026-08-08',
    emergencyStatus: 'Standard',
    additionalMessage: 'Platelet transfusion for pediatric oncology therapy at KEM Hospital Mumbai.',
    status: 'Completed',
    createdAt: '2026-08-07T10:15:00.000Z',
    contactPhone: '+91 98500 67890',
    responsesCount: 5
  }
];

function saveRequestsToDisk() {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist requests to disk:', err);
  }
}

try {
  if (fs.existsSync(REQUESTS_FILE)) {
    const raw = fs.readFileSync(REQUESTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      requests = parsed;
    }
  } else {
    saveRequestsToDisk();
  }
} catch (e) {
  console.warn('Error loading requests file:', e);
}

let messages = [
  {
    id: 'm1',
    conversationId: 'c-d1',
    senderId: 'user-me',
    receiverId: 'd1',
    donorName: 'Dr. Minakshi Pawar',
    donorPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O-',
    text: 'Hello Dr. Minakshi, we have an urgent request at Cigma Hospital for O- blood. Are you available today?',
    timestamp: '2026-08-09T19:30:00Z',
    sender: 'user',
    online: true
  },
  {
    id: 'm2',
    conversationId: 'c-d1',
    senderId: 'd1',
    receiverId: 'user-me',
    donorName: 'Dr. Minakshi Pawar',
    donorPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bloodGroup: 'O-',
    text: 'Yes! I can reach Cigma Hospital in approximately 25 minutes. Please notify the triage unit.',
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
  const { status, bloodGroup, userId } = req.query;
  let filtered = [...requests];

  // User-scoped filtering: When a userId is passed, strictly return only requests belonging to that user
  if (userId) {
    filtered = filtered.filter(r => r.userId === userId);
  }

  if (status && status !== 'All') {
    filtered = filtered.filter(r => r.status && r.status.toLowerCase() === status.toLowerCase());
  }

  if (bloodGroup && bloodGroup !== 'All') {
    filtered = filtered.filter(r => r.bloodGroup && r.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
  }

  res.json({ success: true, count: filtered.length, requests: filtered });
});

app.post('/api/requests', (req, res) => {
  const {
    userId,
    patientName,
    bloodGroup,
    hospitalName,
    hospital,
    location,
    unitsRequired,
    neededByDate,
    neededBy,
    neededByFull,
    urgency,
    isEmergency,
    additionalMessage,
    message
  } = req.body;

  // Validate authenticated identity
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authenticated user ID is required to create a request.' });
  }

  // Validate required fields
  if (!patientName || !bloodGroup || !(hospitalName || hospital) || !location || !unitsRequired) {
    return res.status(400).json({ success: false, message: 'Validation error: patientName, bloodGroup, hospitalName, location, and unitsRequired are required.' });
  }

  const hName = hospital || hospitalName;
  const now = new Date();
  const dateObj = neededByDate ? new Date(neededByDate) : null;
  const shortDate = neededBy || (dateObj && !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Oct 28');
  const fullDate = neededByFull || (dateObj && !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : neededByDate || 'October 28, 2026');

  const newRequest = {
    id: 'req-' + Date.now(),
    userId,
    patientName: patientName.trim(),
    bloodGroup: bloodGroup.trim(),
    hospital: hName.trim(),
    hospitalName: hName.trim(),
    location: location.trim(),
    unitsRequired: parseInt(unitsRequired, 10) || 1,
    neededBy: shortDate,
    neededByFull: fullDate,
    requiredDate: neededByDate || fullDate,
    urgency: urgency || (isEmergency ? 'Critical' : 'Standard'),
    emergencyStatus: urgency || (isEmergency ? 'Critical' : 'Standard'),
    additionalMessage: (additionalMessage || message || '').trim(),
    status: 'Active',
    donorsFound: 0,
    donorsLabel: 'confirmed',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    responsesCount: 0
  };

  requests.unshift(newRequest);
  saveRequestsToDisk();
  res.status(201).json({ success: true, request: newRequest });
});

app.patch('/api/requests/:id', (req, res) => {
  const requestIndex = requests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  const existing = requests[requestIndex];

  // Prevent modifying requests belonging to another user
  if (req.body.userId && existing.userId && req.body.userId !== existing.userId) {
    return res.status(403).json({ success: false, message: 'Forbidden: You cannot modify another user\'s request.' });
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const todayFull = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const updatedRequest = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  if (req.body.status && req.body.status.toLowerCase() === 'cancelled') {
    updatedRequest.status = 'Cancelled';
    updatedRequest.cancelledDate = todayFormatted;
    updatedRequest.cancelledDateFull = todayFull;
    updatedRequest.donorsLabel = '-';
  } else if (req.body.status && req.body.status.toLowerCase() === 'completed') {
    updatedRequest.status = 'Completed';
    updatedRequest.completedDate = todayFormatted;
    updatedRequest.completedDateFull = todayFull;
  }

  requests[requestIndex] = updatedRequest;
  saveRequestsToDisk();
  res.json({ success: true, request: updatedRequest });
});

// Respond to a Blood Request
app.post('/api/requests/:id/respond', (req, res) => {
  const requestIndex = requests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) {
    return res.status(404).json({ success: false, message: 'Blood request not found.' });
  }

  const { donorId, donorName, donorPhone, donorEmail, bloodGroup, message } = req.body;
  if (!donorId) {
    return res.status(400).json({ success: false, message: 'Authenticated donor ID is required to submit a response.' });
  }

  const reqItem = requests[requestIndex];
  if (!Array.isArray(reqItem.responses)) {
    reqItem.responses = [];
  }

  // Prevent duplicate response by the same donor
  const alreadyResponded = reqItem.responses.some(resp => resp.donorId === donorId);
  if (alreadyResponded) {
    return res.status(400).json({
      success: false,
      alreadyResponded: true,
      message: 'You have already submitted a response for this blood request.'
    });
  }

  const newResponse = {
    id: 'resp-' + Date.now(),
    donorId,
    donorName: donorName || 'BloodLink Donor',
    donorPhone: donorPhone || '',
    donorEmail: donorEmail || '',
    bloodGroup: bloodGroup || reqItem.bloodGroup || '',
    message: (message || '').trim(),
    respondedAt: new Date().toISOString()
  };

  reqItem.responses.push(newResponse);
  reqItem.responsesCount = (reqItem.responsesCount || 0) + 1;
  reqItem.donorsFound = (reqItem.donorsFound || 0) + 1;
  reqItem.updatedAt = new Date().toISOString();

  requests[requestIndex] = reqItem;
  saveRequestsToDisk();

  // Create notification for requester and donor
  notifications.unshift({
    id: 'notif-' + Date.now(),
    userId: donorId,
    title: 'Response Submitted',
    message: `You successfully responded to the blood request for ${reqItem.hospital || reqItem.hospitalName} (${reqItem.bloodGroup}).`,
    type: 'response_update',
    requestId: reqItem.id,
    timestamp: new Date().toISOString(),
    read: false
  });

  res.status(201).json({
    success: true,
    message: `Thank you! Your interest in donating for ${reqItem.hospital || reqItem.hospitalName} has been recorded.`,
    response: newResponse,
    request: reqItem
  });
});

// Update Donor Availability
app.patch('/api/donors/availability', (req, res) => {
  const { userId, email, availability } = req.body;
  if (!availability) {
    return res.status(400).json({ success: false, message: 'Availability status is required.' });
  }

  let updatedCount = 0;
  donors = donors.map(d => {
    if ((email && d.email && d.email.toLowerCase() === email.toLowerCase()) || (userId && d.id === userId)) {
      updatedCount++;
      return { ...d, availability };
    }
    return d;
  });

  res.json({ success: true, updated: updatedCount > 0, availability });
});

// In-Memory Notifications Store
let notifications = [
  {
    id: 'notif-101',
    userId: 'all',
    title: 'Urgent O- Blood Needed',
    message: 'Cigma Hospital, Chhatrapati Sambhajinagar requires 3 units of O- blood for emergency bypass surgery.',
    type: 'urgent_request',
    requestId: 'req-101',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false
  },
  {
    id: 'notif-102',
    userId: 'all',
    title: 'Active A+ Request in Pune',
    message: 'Ruby Hall Clinic, Pune requires 2 units of A+ blood for post-accident trauma recovery.',
    type: 'matching_request',
    requestId: 'req-102',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: false
  },
  {
    id: 'notif-103',
    userId: 'all',
    title: 'Welcome to BloodLink Maharashtra',
    message: 'Your voluntary donor profile is active across 36 districts of Maharashtra.',
    type: 'account',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true
  }
];

app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  const userNotifs = notifications.filter(n => n.userId === 'all' || (userId && n.userId === userId));
  res.json({ success: true, count: userNotifs.length, notifications: userNotifs });
});

app.post('/api/notifications', (req, res) => {
  const newNotif = {
    id: 'notif-' + Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...req.body
  };
  notifications.unshift(newNotif);
  res.status(201).json({ success: true, notification: newNotif });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    return res.json({ success: true, notification: notif });
  }
  res.status(404).json({ success: false, message: 'Notification not found' });
});

app.patch('/api/notifications/mark-all-read', (req, res) => {
  const { userId } = req.body;
  notifications.forEach(n => {
    if (n.userId === 'all' || (userId && n.userId === userId)) {
      n.read = true;
    }
  });
  res.json({ success: true, message: 'All notifications marked as read' });
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
