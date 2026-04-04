import Link from 'next/link';
import { Button } from '@/components/button';
import { UserCircle, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-linear-to-br from-blue-50 to-white text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Real-time Patient <span className="text-blue-600">Information System</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A secure and efficient way to collect patient data and monitor updates in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          <Link href="/patient" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-400 transition-all text-center space-y-4 w-72">
              <div className="bg-blue-100 text-blue-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <UserCircle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Patient Portal</h2>
              <p className="text-sm text-gray-500 italic">Fill out registration forms</p>
              <Button className="w-full">Access Patient Form</Button>
            </div>
          </Link>

          <Link href="/staff-view" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-green-400 transition-all text-center space-y-4 w-72">
              <div className="bg-green-100 text-green-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Staff Dashboard</h2>
              <p className="text-sm text-gray-500 italic">Monitor live updates</p>
              <Button variant="secondary" className="w-full bg-green-600 text-white hover:bg-green-700">Access Dashboard</Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
