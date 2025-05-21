This is a [Next.js](https://nextjs.org) project coming from experiments I performed using
  both ChatGPT 4o and Claude 3.7 to translate architecture specifications into working code.

It is a work in progress and is not functionally complete.

## Getting Started

The application is based on Next.js utilizing Supabase for persistent storage.

First, run the development server:

```bash
#install components and initialize database
npm install
npx supabase init
npx supabase start -x vector
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Architecture and MVP Implementation Tasks

The application architecture is described in ```design/archiecture.md``` - the required implementation tasks to construct the MVP are outlined in ```design/tasks.md```

I am currently using Claude as a coding companion. We are working down the task list sequentially.  The next task to be implemented will be "Implement Output Port Block Node".

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
