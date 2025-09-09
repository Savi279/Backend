import SupportTicket from '../models/SupportTicket.js';

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
const createTicket = async (req, res) => {
  const { subject, description, priority } = req.body;
  const userId = req.user.id;

  try {
    const ticket = new SupportTicket({
      user: userId,
      subject,
      description,
      priority: priority || 'medium',
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's support tickets
// @route   GET /api/support/my-tickets
// @access  Private
const getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id })
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all support tickets
// @route   GET /api/support
// @access  Private/Admin
const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update ticket status
// @route   PUT /api/support/:id
// @access  Private/Admin
const updateTicket = async (req, res) => {
  const { status, assignedTo, priority } = req.body;

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    ticket.status = status || ticket.status;
    ticket.assignedTo = assignedTo || ticket.assignedTo;
    ticket.priority = priority || ticket.priority;

    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add comment to ticket
// @route   POST /api/support/:id/comment
// @access  Private
const addComment = async (req, res) => {
  const { comment } = req.body;
  const userId = req.user.id;

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check if user is the ticket owner or admin
    if (ticket.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    ticket.comments.push({
      user: userId,
      comment,
    });

    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export { createTicket, getUserTickets, getAllTickets, updateTicket, addComment };
