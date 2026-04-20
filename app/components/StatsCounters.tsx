"use client";

import { useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Music, Radio, Monitor, Smartphone } from 'lucide-react';

interface StatsProps {
  playlists: number;
  xtream: number;
  mac: number;
  apps: number;
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      if (start === end) return;
      
      const duration = 2000;
      let startTime = performance.now();

      const updateCounter = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
          setCurrentValue(Math.floor(start + (end - start) * (elapsedTime / duration)));
          requestAnimationFrame(updateCounter);
        } else {
          setCurrentValue(end);
        }
      };
      
      requestAnimationFrame(updateCounter);
    }
  }, [value, isInView]);

  return <span ref={ref}>{currentValue}</span>;
};

export default function StatsCounters({ stats }: { stats: StatsProps }) {
  const items = [
    { label: 'Playlists M3U', value: stats.playlists, icon: <Music className="text-primary mb-2" size={28} /> },
    { label: 'Accès Xtream', value: stats.xtream, icon: <Radio className="text-[#00D4AA] mb-2" size={28} /> },
    { label: 'Portails Mac', value: stats.mac, icon: <Monitor className="text-[#FFAD00] mb-2" size={28} /> },
    { label: 'Applications', value: stats.apps, icon: <Smartphone className="text-[#E72B78] mb-2" size={28} /> },
  ];

  return (
    <section className="relative z-20 -mt-8 mb-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="linear-card p-6 flex flex-col items-center text-center group"
            >
              <div className="bg-surface p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter value={item.value} />+
              </h3>
              <p className="text-sm font-medium text-foreground-secondary">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
