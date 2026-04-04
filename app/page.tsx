import Link from 'next/link';
import { Button } from '@/components/button';
import { UserCircle, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-linear-to-br from-blue-50 to-white text-center">
      <div className="max-w-4xl w-full space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Real-time Patient <span className="text-blue-600">Sync System</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Securely collect patient data and monitor updates in real-time across all devices.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-stretch max-w-3xl mx-auto w-full">
          <Link href="/patient" className="group flex-1 flex">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 hover:border-blue-400 transition-all text-center space-y-6 w-full flex flex-col justify-between items-center">
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 h-20 w-20 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg shadow-blue-100">
                  <UserCircle className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Patient Portal</h2>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Registration Form</p>
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100">Access Form</Button>
            </div>
          </Link>

          <Link href="/staff-view" className="group flex-1 flex">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 hover:border-green-400 transition-all text-center space-y-6 w-full flex flex-col justify-between items-center">
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="bg-green-100 text-green-600 h-20 w-20 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-lg shadow-green-100">
                  <ShieldCheck className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Staff View</h2>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Live Monitor</p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full h-14 rounded-2xl bg-green-600 text-white hover:bg-green-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100"
              >
                Access Dashboard
              </Button>
            </div>
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            Powered by Supabase Realtime Engine
          </p>
        </div>
      </div>
    </div>
  );
}
