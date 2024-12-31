import { redirect } from 'next/navigation';

export default async function RootPage() {
  redirect('/home');
  // Need to return something even though redirect will be called
  return null;
} 