# Medicus 🏥

**AI-Powered Prescription Drug Sales Platform**

Medicus is a digital platform that revolutionizes how pharmaceutical sales reps connect with healthcare providers, delivering the right information to the right provider at the right time.

![Built with](https://img.shields.io/badge/Built%20with-React%20%7C%20Next.js%20%7C%20TypeScript-blue)
![AI Powered](https://img.shields.io/badge/AI%20Powered-OpenAI%20%7C%20Mastra%20%7C%20Cedar-green)
![Healthcare](https://img.shields.io/badge/Industry-Healthcare%20%7C%20Pharmaceuticals-red)

## 🌟 Inspiration

We were inspired by the challenge of improving HCP (Healthcare Provider) engagement. Doctors are often overwhelmed by irrelevant information, while pharmaceutical sales reps spend time and money traveling to hospitals without knowing if their visit will add value. We wanted to create a solution that is smarter, more efficient, and more equitable: one that delivers the right information, to the right provider, at the right time.

## 🚀 What Medicus Does

Medicus is a digital platform that allows pharmaceutical sales reps to upload prescription drugs, complete with clinical trial data, prescribing information, and therapeutic evidence. Using an AI search engine powered by BioBERT embeddings, doctors can easily preview relevant information before a sales visit. This helps doctors get the right information at the right time, while sales reps save resources and focus their visits on the hospitals that will truly benefit.

### Key Features

- **💊 Smart Drug Management**: Upload prescription drugs with clinical data, prescribing information, and therapeutic evidence
- **🤖 AI-Powered Campaign Generation**: Generate personalized email campaigns using OpenAI
- **📧 Intelligent Email Delivery**: Send targeted communications to healthcare providers
- **📊 Analytics Dashboard**: Track campaign performance and drug engagement
- **🔍 HCP Database**: Manage healthcare provider contacts and specialties
- **📄 Clinical Research Integration**: Upload and manage PDFs, Phase I/II/III trials, and prescribing information
- **🎯 Smart Link Generation**: Create trackable drug information pages
- **💡 Real-time AI Assistance**: Cedar-OS powered chat for doctors to interact with drug information and clinical evidence

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
git clone https://github.com/Tjust032/gt-hackathon-2025
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

### For Pharmaceutical Sales Representatives

1. **Drug Registration**: Upload prescription drugs with clinical trial data, prescribing information, and therapeutic evidence
2. **Campaign Creation**: Generate AI-powered, personalized email campaigns targeting specific therapeutic areas
3. **HCP Targeting**: Select specific healthcare provider specialties and demographics
4. **Performance Tracking**: Monitor email engagement and drug interest

### For Healthcare Providers

1. **Drug Discovery**: Browse and search prescription drugs relevant to their specialty and patient population
2. **Clinical Review**: Access Phase I/II/III trial data, prescribing information, and FDA approval documentation
3. **Smart Links**: Preview drug information and clinical evidence before sales meetings
4. **Informed Decisions**: Make better-informed prescribing decisions based on comprehensive evidence

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

- **🏢 Enterprise Partnerships**: Pitch to pharmaceutical companies like Amgen, Bristol Myers Squibb, Johnson & Johnson, and Incyte
- **📈 Advanced Analytics**: Implement predictive analytics for sales optimization and prescribing pattern analysis
- **🌐 Global Expansion**: Scale to international healthcare markets
- **🔒 Enhanced Security**: Implement advanced healthcare data protection and HIPAA compliance
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
