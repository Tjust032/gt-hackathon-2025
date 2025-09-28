# Medicus 🏥

**AI-Powered Medical Device Sales Platform**

Medicus is a digital platform that revolutionizes how medical device sales reps connect with healthcare providers, delivering the right information to the right provider at the right time.

![Built with](https://img.shields.io/badge/Built%20with-React%20%7C%20Next.js%20%7C%20TypeScript-blue)
![AI Powered](https://img.shields.io/badge/AI%20Powered-OpenAI%20%7C%20Mastra%20%7C%20Cedar-green)
![Healthcare](https://img.shields.io/badge/Industry-Healthcare%20%7C%20Medical%20Devices-red)

## 🌟 Inspiration

We were inspired by the challenge of improving HCP (Healthcare Provider) engagement. Doctors are often overwhelmed by irrelevant information, while sales reps spend time and money traveling to hospitals without knowing if their visit will add value. We wanted to create a solution that is smarter, more efficient, and more equitable: one that delivers the right information, to the right provider, at the right time.

## 🚀 What Medicus Does

Medicus is a digital platform that allows medical device sales reps to upload their products, complete with clinical research, safety data, and use cases. Using an AI search engine, doctors can easily preview relevant information before a sales visit. This helps doctors get the right information at the right time, while sales reps save resources and focus their visits on the hospitals that will truly benefit.

### Key Features

- **📱 Smart Device Management**: Upload medical devices with clinical data, safety information, and use cases
- **🤖 AI-Powered Campaign Generation**: Generate personalized email campaigns using OpenAI
- **📧 Intelligent Email Delivery**: Send targeted communications to healthcare providers
- **📊 Analytics Dashboard**: Track campaign performance and device engagement
- **🔍 HCP Database**: Manage healthcare provider contacts and specialties
- **📄 Clinical Research Integration**: Upload and manage PDFs, clinical trials, and research papers
- **🎯 Smart Link Generation**: Create trackable device information pages
- **💡 Real-time AI Assistance**: Cedar-OS powered chat for doctors to interact with the information.

## 🛠️ How We Built It

We built Medicus with a modern, reliable stack that balances speed, scalability, and security:

### Frontend

- **Next.js 15.4.4** with App Router - React framework
- **React 19.1.0** - Latest React with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.x** - Modern utility-first styling
- **Cedar-OS** - AI copilot framework for intelligent UX
- **Radix UI** - Accessible headless components
- **Framer Motion** - Smooth animations and transitions

### Backend & AI

- **Mastra** - Backend framework for AI agent orchestration
- **OpenAI GPT-4** - AI-powered content generation
- **Zod** - Schema validation for robust data integrity
- **LibSQL** - SQLite-compatible database for device and user data

### Email & Communication

- **React Email** - Beautiful, responsive email templates
- **Gmail HTML Email API** - Reliable email delivery service

### Development & Deployment

- **Docker** - Containerized deployment for consistency
- **Turbopack** - Fast development bundler
- **ESLint & Prettier** - Code quality and formatting

This stack enabled us to rapidly prototype while building toward a system that can scale in real-world healthcare environments.

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 20+
- OpenAI API key
- npm or pnpm

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd gt-hackathon-2025
npm install && cd src/backend && npm install && cd ../..
```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:

```bash
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

3. **Start the development servers:**

```bash
npm run dev
```

This runs both the Next.js frontend and Mastra backend concurrently:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4111

## 🎯 Key Workflows

### For Sales Representatives

1. **Device Registration**: Upload medical devices with clinical research and safety data
2. **Campaign Creation**: Generate AI-powered, personalized email campaigns
3. **HCP Targeting**: Select specific healthcare provider specialties and demographics
4. **Performance Tracking**: Monitor email engagement and device interest

### For Healthcare Providers

1. **Device Discovery**: Browse and search medical devices relevant to their specialty
2. **Clinical Review**: Access clinical research, safety data, and use cases
3. **Smart Links**: Preview device information before sales meetings
4. **Informed Decisions**: Make better-informed purchasing decisions

## 🚧 Challenges We Overcame

A major challenge was balancing information delivery - we wanted to avoid spamming doctors with jargon while ensuring they have the resources to benefit from the platform. We had to ideate different workflows that work equally well for sales reps and doctors, who have very different needs and time constraints.

## 🏆 Accomplishments We're Proud Of

- **⚡ Rapid Development**: Built a functional prototype in under 36 hours
- **🎨 User-Centric Design**: Created workflows that support both reps and doctors
- **🌍 Social Impact**: Developed a solution that could expand access to rural and underfunded hospitals
- **🤖 AI Integration**: Successfully implemented intelligent campaign generation
- **📧 Email Automation**: Built seamless email delivery with beautiful templates

## 📚 What We Learned

The healthcare system is quite complex, and navigating it to create an effective tool is challenging. User input and feedback would have been instrumental - we'd like to thank the team at Impiricus for their valuable feedback and ideas.

## 🔮 What's Next for Medicus

We see countless possibilities for Medicus:

- **🏢 Enterprise Partnerships**: Pitch to med-tech companies like Medtronic or J&J
- **📈 Advanced Analytics**: Implement predictive analytics for sales optimization
- **🌐 Global Expansion**: Scale to international healthcare markets
- **🔒 Enhanced Security**: Implement advanced healthcare data protection
- **📱 Mobile Apps**: Native mobile applications for on-the-go access

## 🏗️ Project Architecture

### Frontend Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Main dashboard pages
│   ├── device/           # Device detail pages
│   └── api/              # API routes
├── components/           # React components
│   └── medical-device/   # Domain-specific components
├── cedar/               # Cedar-OS components
└── lib/                 # Utilities and mock data
```

### Backend Structure

```
src/backend/
├── src/mastra/          # Mastra configuration
│   ├── agents/         # AI agents
│   ├── tools/          # Custom tools
│   └── workflows/      # Process workflows
└── storage.db          # SQLite database
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📜 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Impiricus Team** - For valuable feedback and healthcare industry insights
- **GT Hackathon 2025** - For providing the platform to build this solution
- **Cedar-OS & Mastra Teams** - For the excellent development frameworks

---

**Built with ❤️ for healthcare innovation at GT Hackathon 2025**
