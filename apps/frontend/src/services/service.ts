export const getSecurityTip = async (): Promise<string> => {
  // Mock security tips - in production, this would call an actual AI service
  const tips = [
    "Use a unique password for each account to prevent credential stuffing attacks.",
    "Enable two-factor authentication whenever possible for an extra layer of security.",
    "Be cautious of phishing attempts - always verify the sender before clicking links.",
    "Use a password manager to generate and store strong, unique passwords.",
    "Regularly review your account activity and log out from unused sessions.",
  ];

  return tips[Math.floor(Math.random() * tips.length)];
};

export const getAIGreeting = async (name: string): Promise<string> => {
  // Mock AI greetings - in production, this would call an actual AI service
  const greetings = [
    `Welcome back, ${name}! Your digital fortress awaits.`,
    `Hello ${name}! Ready to secure your digital identity?`,
    `Greetings ${name}! Your portal is at your command.`,
    `${name}, it's great to see you again! Let's make today secure.`,
    `Welcome ${name}! Your identity ecosystem is ready for action.`,
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
};
