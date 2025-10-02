// simple in-memory tree for MVP – migrate to DB later
export const tree = {
  id: 'root',
  question: 'Device powers on?',
  yes: {
    id: 'pwr_yes',
    question: 'Error code displayed?',
    yes: {
      id: 'err_yes',
      question: 'Code starts with E-1?',
      yes:  { solution: 'Check power supply cable & fuse – replace if blown.' },
      no:   { solution: 'Contact manufacturer support with exact code.' }
    },
    no: {
      id: 'err_no',
      question: 'Image quality poor?',
      yes:  { solution: 'Clean lens & calibrate camera module.' },
      no:   { solution: 'Device appears healthy – routine maintenance.' }
    }
  },
  no: {
    id: 'pwr_no',
    question: 'Power LED off?',
    yes:  { solution: 'Verify outlet & power brick – replace brick if needed.' },
    no:   { solution: 'Internal failure – escalate to L2 technician.' }
  }
};