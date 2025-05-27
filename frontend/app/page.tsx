import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            On-Chain Guard
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Instantly spot wallets behaving oddly onchain—no PhD in blockchain required.
          </p>
          <Link 
            href="/anomalies"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Explore the Dashboard
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Smart AI Alerts</h3>
            <p className="text-gray-300">
              Our IsolationForest model learns “normal” token flows and flags the rest—no manual rules.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Live Wallet Watch</h3>
            <p className="text-gray-300">
              See the top suspicious wallets update in real time, filter & export CSV in a click.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Time-Travel Charts</h3>
            <p className="text-gray-300">
              Peek at a wallet’s “weirdness” over time—spot sudden spikes or long-term trends.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg">
            <ol className="space-y-4 list-decimal list-inside text-gray-300">
              <li>We pull raw on-chain transfers into Parquet files</li>
              <li>Compute per-wallet stats (flows, ratios, volumes)</li>
              <li>Train an IsolationForest to learn “normal” behavior</li>
              <li>Serve scores & history via FastAPI, view in Next.js charts</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Quickstart Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Quick Start</h2>
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg">
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-gray-300">
              <code>
                git clone https://github.com/vaishnavigavi/onchain-guard.git{'\n'}
                cd onchain-guard{'\n'}
                docker-compose up --build
              </code>
            </pre>
            <p className="mt-4 text-gray-300">
              Open <a href="http://localhost:3000" className="text-cyan-400 hover:underline">localhost:3000</a> for the UI  
              and <a href="http://localhost:8000/docs" className="text-cyan-400 hover:underline">localhost:8000/docs</a> for API.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 space-y-4 md:space-y-0">
          <span>© 2024 On-Chain Guard</span>
          <div className="space-x-4">
            <a href="https://github.com/vaishnavigavi/onchain-guard">GitHub</a>
            <a href="http://localhost:8000/docs">API Docs</a>
            <a href="https://github.com/vaishnavigavi/onchain-guard/blob/main/LICENSE">License</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
