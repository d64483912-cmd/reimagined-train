# Nelson-GPT Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git
- Supabase account
- Mistral AI API key

### Installation

1. **Clone the repository**
   ```bash
   cd /home/code/nelson-gpt
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   MISTRAL_API_KEY=your_mistral_key
   DATABASE_URL=your_database_url
   ```

### Development

1. **Start the development server**
   ```bash
   bun run dev
   ```

2. **Open in browser**
   - Local: http://localhost:3004
   - Public: https://nelson-gpt-10.lindy.site

3. **Test the application**
   - Wait for splash screen to complete
   - Type a medical question
   - Click send button
   - View AI response

### Building for Production

1. **Create production build**
   ```bash
   bun run build
   ```

2. **Start production server**
   ```bash
   bun run start
   ```

3. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

## 📝 Example Queries

### Symptom Assessment
- "What are the common causes of fever in a 2-year-old?"
- "My 6-month-old has diarrhea and vomiting. What should I do?"
- "What are the signs of dehydration in infants?"

### Diagnosis Help
- "How do I differentiate between viral and bacterial meningitis?"
- "What's the differential diagnosis for a rash in a child?"
- "How do I diagnose acute otitis media?"

### Treatment Information
- "What's the first-line treatment for strep throat in children?"
- "How do I dose amoxicillin for a 3-year-old?"
- "What are the treatment options for asthma in children?"

### Guidelines
- "What are the current vaccination guidelines?"
- "What's the recommended screening for developmental delays?"
- "What are the guidelines for antibiotic use in children?"

## 🎯 Key Features

### Chat Interface
- **Message Input**: Type your medical question
- **Send Button**: Submit your query
- **Loading Indicator**: Shows when AI is processing
- **Message History**: All messages are saved
- **Markdown Support**: Rich text formatting in responses

### Medical Features
- **Age-Appropriate Guidance**: Tailored to patient age
- **Differential Diagnosis**: Multiple diagnostic possibilities
- **Treatment Plans**: Evidence-based recommendations
- **Safety Checks**: Contraindication and interaction warnings
- **Red Flags**: Urgent evaluation indicators

### User Interface
- **Dark/Light Mode**: Theme toggle in sidebar
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Professional transitions
- **Auto-Scroll**: Follows latest messages
- **Sidebar Navigation**: Quick access to features

## 🔧 Configuration

### Mistral AI Settings
- **Model**: mistral-large-latest
- **Temperature**: 0.2 (low for accuracy)
- **Max Tokens**: 2048
- **Top P**: 0.9

### Database
- **Provider**: Supabase (PostgreSQL)
- **Tables**: messages, queries, user_sessions, medical_context_summary
- **Persistence**: All conversations saved

### API Endpoints
- **Chat**: POST `/api/chat`
- **Orchestrated**: POST `/api/chat/orchestrated`

## 📊 Project Structure

```
nelson-gpt/
├── app/
│   ├── page.tsx              # Main chat UI
│   ├── layout.tsx            # Root layout
│   └── api/chat/route.ts     # Chat API
├── components/
│   ├── sidebar.tsx           # Navigation
│   ├── chat-input.tsx        # Input field
│   ├── markdown-renderer.tsx # Text rendering
│   └── splash-screen.tsx     # Welcome screen
├── lib/
│   ├── backend.config.ts     # Configuration
│   ├── chat-service.ts       # API client
│   ├── rag-pipeline.ts       # RAG logic
│   └── medical-orchestrator.ts # Medical AI
├── public/                   # Static files
├── styles/                   # Global CSS
└── .env.local               # Environment vars
```

## 🧪 Testing

### Manual Testing
1. Open application in browser
2. Wait for splash screen
3. Type a medical question
4. Click send button
5. Verify response appears
6. Check markdown formatting
7. Test dark mode toggle

### API Testing
```bash
# Test chat endpoint
curl -X POST http://localhost:3004/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What causes fever?",
    "sessionId": "test-session",
    "conversationId": "test-conversation"
  }'
```

## 🐛 Troubleshooting

### Application won't start
- Check Node.js version: `node --version`
- Clear cache: `rm -rf .next`
- Reinstall dependencies: `bun install`

### API errors
- Verify environment variables in `.env.local`
- Check Supabase connection
- Verify Mistral API key
- Check server logs: `tail -f server.log`

### Database errors
- Verify Supabase credentials
- Check database tables exist
- Verify service role key permissions

### Styling issues
- Clear browser cache
- Rebuild CSS: `bun run build`
- Check Tailwind configuration

## 📚 Documentation

- **IMPLEMENTATION_SUMMARY.md** - Complete overview
- **RAG_PIPELINE_ARCHITECTURE.md** - Technical details
- **backend.config.ts** - Configuration reference
- **Code comments** - Inline documentation

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] Supabase credentials verified
- [ ] Mistral API key active
- [ ] Build completes successfully
- [ ] Application tested locally
- [ ] Ready for Vercel deployment

## 📞 Support

### Common Issues

**Q: Application loads but no response to messages**
A: Check server logs and verify API endpoint is working

**Q: Styling looks broken**
A: Clear browser cache and rebuild: `bun run build`

**Q: Database errors**
A: Verify Supabase credentials and table permissions

**Q: Slow responses**
A: Check Mistral API rate limits and network connection

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Mistral AI](https://mistral.ai)
- [LangChain](https://langchain.com)

## 📈 Performance Tips

1. **Optimize Images**: Use next/image component
2. **Code Splitting**: Lazy load components
3. **Caching**: Implement response caching
4. **Database**: Add indexes to frequently queried columns
5. **API**: Implement request batching

## 🔐 Security Best Practices

1. **Never commit .env.local**
2. **Use environment variables for secrets**
3. **Validate all user inputs**
4. **Sanitize API responses**
5. **Use HTTPS in production**
6. **Implement rate limiting**
7. **Monitor for suspicious activity**

## 📝 Version History

- **v1.0.0** (Oct 20, 2025) - Initial release
  - Full chat interface
  - RAG pipeline integration
  - Supabase persistence
  - Mistral AI integration

## 🎉 Success!

You now have a fully functional Nelson-GPT application ready for use and deployment!

For questions or issues, refer to the documentation or check the code comments.

---

**Happy coding! 🚀**
