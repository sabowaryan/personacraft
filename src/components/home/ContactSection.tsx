'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContactSection() {
  return (
    <section 
      id="contact" 
      className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black py-24 lg:py-32 overflow-hidden"
      aria-labelledby="contact-title"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            id="contact-title"
            className="text-4xl lg:text-6xl font-black text-white mb-8 leading-tight"
          >
            Prêt à révolutionner{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              votre marketing
            </span>{' '}
            ?
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Rejoignez les marketeurs qui utilisent PersonaCraft pour créer
            des campagnes plus ciblées et efficaces grâce à l'IA
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <Link href="/dashboard" className="group relative">
            <Button 
              size="lg" 
              className="bg-white text-slate-900 text-xl font-bold px-12 py-6 rounded-2xl transition-all duration-500 hover:bg-slate-50 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 min-w-[280px] h-auto"
            >
              <svg className="w-6 h-6 transition-transform group-hover:scale-125 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Commencer gratuitement</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            </Button>
          </Link>
          
          <Link href="/demo">
            <Button 
              variant="outline" 
              size="lg"
              className="bg-transparent border-2 border-white/30 text-white text-xl font-bold px-12 py-6 rounded-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/50 hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 min-w-[280px] h-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Voir la démo</span>
            </Button>
          </Link>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email</h3>
            <p className="text-white/80">contact@personacraft.ai</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Chat</h3>
            <p className="text-white/80">Support en temps réel</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Support</h3>
            <p className="text-white/80">24/7 pour les plans Pro+</p>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Restez informé des nouveautés
            </h3>
            <p className="text-white/80 mb-6">
              Recevez nos dernières mises à jour, conseils marketing et études de cas
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                required
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap"
              >
                S'abonner
              </Button>
            </form>
            
            <p className="text-white/60 text-sm mt-4">
              Pas de spam, désabonnement en un clic
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-12">
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}