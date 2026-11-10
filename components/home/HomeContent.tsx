'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Linkedin, Github, Mail } from 'lucide-react'
import PartyBackground from '@/components/home/PartyBackground'
import StringLights from '@/components/home/StringLights'
import InteractiveCursor from '@/components/home/InteractiveCursor'
import GuestbookBubbles from '@/components/home/GuestbookBubbles'
import PageViewCounter from '@/components/home/PageViewCounter'
import Reveal from '@/components/home/anim/Reveal'
import Magnetic from '@/components/home/anim/Magnetic'
import TiltCard from '@/components/home/anim/TiltCard'
import RotatingWord from '@/components/home/anim/RotatingWord'

export interface RecentMovie {
  title: string
  type: string
  rating: number
  review: string
  posterUrl: string | null
}

export interface RecentDish {
  dishName: string
  category: string
  rating: number
  review: string
  imageUrl: string | null
}

export interface RecentPost {
  id: string
  title: string
  content: string
  imageUrl: string | null
  blogType: string | null
  publishDate: string
}

export interface RecentProject {
  title: string
  description: string
  techStack: string[]
}

export interface RecentNote {
  title: string
  content: string
  category: string | null
}

interface HomeContentProps {
  movie: RecentMovie | null
  cooking: RecentDish | null
  blog: RecentPost | null
  project: RecentProject | null
  note: RecentNote | null
}

const HEADLINE_WORDS = ['Pull', 'up', 'a', 'chair.']

const HOSTING_WORDS = ['supper clubs', 'movie nights', 'long dinners', 'game nights', 'Kubernetes clusters']

const MARQUEE_ITEMS = [
  'supper clubs',
  'movie nights',
  'home cooking',
  'good company',
  'cloud by day',
  'candles by night',
  'always plating',
  'always deploying',
]

export default function HomeContent({ movie, cooking, blog, project, note }: HomeContentProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-screen bg-cream dark:bg-night text-night dark:text-cream transition-colors duration-500 overflow-x-clip">
      <PartyBackground />
      <InteractiveCursor />
      <GuestbookBubbles />

      {/* ============ HERO ============ */}
      <section className="relative pt-24 pb-16 sm:pt-28 sm:pb-24">
        <StringLights />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
            {/* LEFT — headline + bio */}
            <div className="flex-1 w-full">
              {/* Eyebrow badge */}
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-saffron-100 dark:bg-saffron-500/15 border border-saffron-300/70 dark:border-saffron-500/30 text-sm font-medium text-saffron-800 dark:text-saffron-300"
              >
                <span className="animate-bounce-slow inline-block">🥂</span>
                you made it — come on in
              </motion.div>

              {/* Kinetic headline */}
              <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-5">
                {HEADLINE_WORDS.map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.22em] last:mr-0"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 46, rotate: i % 2 === 0 ? -6 : 6 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 14, delay: 0.18 + i * 0.09 }}
                  >
                    {word === 'chair.' ? (
                      <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-ember-500 via-berry-500 to-saffron-500">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </motion.span>
                ))}
              </h1>

              {/* Rotating hosting line */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 130, damping: 16, delay: 0.62 }}
                className="text-lg sm:text-xl text-night/70 dark:text-cream/70 mb-8"
              >
                I&apos;m Parag, and I host{' '}
                <RotatingWord
                  words={HOSTING_WORDS}
                  className="font-display italic font-semibold text-ember-600 dark:text-ember-400"
                />
              </motion.p>

              {/* Bio */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 110, damping: 16, delay: 0.75 }}
                className="max-w-2xl space-y-4 text-base leading-relaxed text-night/75 dark:text-cream/75
                  [&>p]:transition-all [&>p]:duration-200
                  [&>p:hover]:text-night [&>p:hover]:dark:text-cream
                  [&>p:hover]:bg-gradient-to-r [&>p:hover]:from-ember-100/70 [&>p:hover]:to-transparent
                  [&>p:hover]:dark:from-ember-500/10 [&>p:hover]:dark:to-transparent
                  [&>p:hover]:px-4 [&>p:hover]:py-2 [&>p:hover]:rounded-xl [&>p:hover]:-mx-4"
              >
                <p>
                  Some people collect vinyl. I collect people around a table. Supper clubs, movie nights, game nights, dinners that run long past midnight — if there&apos;s good food on the table and nobody&apos;s reaching for their coat, that&apos;s my kind of evening.
                </p>
                <p>
                  It usually starts in the kitchen. I cook the way I host: generous, a little experimental, never the same menu twice. Some dishes turn out to be triumphs, some turn out to be stories — both get reviewed honestly around here.
                </p>
                <p>
                  The couch gets equal billing. Films and shows are watched, rated, and argued about with the seriousness other people reserve for spreadsheets. The ones worth remembering end up on the blog.
                </p>
                <p>
                  So look around — steal a recipe, take a movie recommendation, leave a note in the guestbook. The door&apos;s open, and there&apos;s always room at the table.
                </p>
              </motion.div>

              {/* Socials + visitors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.9 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <SocialButton href="https://www.linkedin.com/in/parag-salunkhe" label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </SocialButton>
                <SocialButton href="https://github.com/Parag-S-Salunkhe" label="GitHub">
                  <Github className="w-5 h-5" />
                </SocialButton>
                <SocialButton href="mailto:paragsalunkhe28@gmail.com" label="Email">
                  <Mail className="w-5 h-5" />
                </SocialButton>
                <div className="pl-2">
                  <PageViewCounter />
                </div>
              </motion.div>
            </div>

            {/* RIGHT — polaroid portrait */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -30, rotate: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotate: 3, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.35 }}
              className="relative flex-shrink-0"
            >
              {/* Warm glow behind the photo */}
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-saffron-300/50 via-ember-300/40 to-berry-300/40 dark:from-saffron-500/20 dark:via-ember-500/15 dark:to-berry-500/15 blur-2xl" />

              <TiltCard maxTilt={5} className="relative">
                <div className="relative bg-white dark:bg-cream p-3 pb-14 rounded-xl shadow-2xl shadow-ember-900/20 dark:shadow-black/50">
                  {/* Tape strip */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-saffron-200/80 dark:bg-saffron-300/70 rotate-[-2deg] rounded-sm shadow-sm" />
                  <div className="relative w-[230px] h-[260px] sm:w-[270px] sm:h-[300px] overflow-hidden rounded-md bg-cream-soft">
                    <Image src="/profile.jpg" alt="Parag Salunkhe" fill className="object-cover" priority />
                  </div>
                  <p className="absolute bottom-4 left-0 right-0 text-center font-display italic text-lg text-night/80">
                    your host, most evenings 🍷
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE STRIP ============ */}
      <div className="relative py-2 -rotate-1 scale-[1.02]">
        <div className="bg-gradient-to-r from-ember-600 via-berry-600 to-ember-600 dark:from-ember-700 dark:via-berry-700 dark:to-ember-700 py-3 overflow-hidden shadow-lg shadow-ember-900/20">
          <div className={`flex w-max whitespace-nowrap ${reduceMotion ? '' : 'animate-marquee'}`}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
                {MARQUEE_ITEMS.map((item) => (
                  <span key={`${copy}-${item}`} className="flex items-center text-cream font-display italic text-sm sm:text-base tracking-wide uppercase">
                    <span className="mx-4 sm:mx-6">{item}</span>
                    <span className="text-saffron-300">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ RECENT UPDATES ============ */}
      <section className="relative py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-12" y={30}>
            <p className="font-medium text-sm uppercase tracking-[0.2em] text-ember-600 dark:text-ember-400 mb-3">
              recent updates
            </p>
            <h2 className="font-display font-semibold text-4xl sm:text-5xl tracking-tight">
              Fresh out of the <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 to-ember-500">oven</span>
            </h2>
            <p className="mt-3 text-night/60 dark:text-cream/60">
              The latest from the kitchen, the couch, and the terminal.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7" style={{ perspective: 1200 }}>
            <Reveal delay={0} rotate={-2}>
              <MovieCard movie={movie} />
            </Reveal>
            <Reveal delay={0.08} rotate={2}>
              <CookingCard dish={cooking} />
            </Reveal>
            <Reveal delay={0.16} rotate={-2}>
              <BlogCard post={blog} />
            </Reveal>
            <Reveal delay={0.24} rotate={2}>
              <ProjectCard project={project} />
            </Reveal>
            <Reveal delay={0.32} rotate={-2}>
              <NoteCard note={note} />
            </Reveal>
          </div>
        </div>
      </section>

      <div className="pb-16" />
    </div>
  )
}

/* ---------- Shared bits ---------- */

function SocialButton({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Magnetic strength={0.4}>
      <Link
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        aria-label={label}
        className="group flex w-12 h-12 rounded-full items-center justify-center bg-cream-card dark:bg-night-card border border-cream-line dark:border-night-line text-night/70 dark:text-cream/70 shadow-sm transition-all duration-300 hover:text-ember-600 dark:hover:text-ember-400 hover:border-ember-400 dark:hover:border-ember-500 hover:shadow-lg hover:shadow-ember-500/25 active:scale-90"
      >
        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          {children}
        </span>
      </Link>
    </Magnetic>
  )
}

function CardShell({
  href,
  emoji,
  heading,
  accentText,
  accentBorder,
  accentShadow,
  tint,
  footer,
  children,
}: {
  href: string
  emoji: string
  heading: string
  accentText: string
  accentBorder: string
  accentShadow: string
  tint: string
  footer: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="block group h-full">
      <TiltCard className={`relative h-full rounded-2xl bg-gradient-to-br ${tint} border border-cream-line dark:border-night-line p-6 shadow-sm transition-colors duration-300 ${accentBorder} ${accentShadow}`}>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-2xl inline-block group-hover:animate-wiggle">{emoji}</span>
          <h3 className={`font-display font-semibold text-lg ${accentText}`}>{heading}</h3>
        </div>
        {children}
        <div className={`mt-4 text-sm font-medium flex items-center justify-end gap-1 ${accentText}`}>
          {footer}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </div>
      </TiltCard>
    </Link>
  )
}

function EmptyCard({ emoji, heading, message }: { emoji: string; heading: string; message: string }) {
  return (
    <div className="h-full rounded-2xl bg-cream-card dark:bg-night-card border border-dashed border-cream-line dark:border-night-line p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-2xl">{emoji}</span>
        <h3 className="font-display font-semibold text-lg text-night/70 dark:text-cream/70">{heading}</h3>
      </div>
      <p className="text-sm text-night/50 dark:text-cream/50">{message}</p>
    </div>
  )
}

function Stars({ rating, className }: { rating: number; className: string }) {
  return <span className={`text-xs tracking-tight ${className}`}>{'★'.repeat(Math.max(0, Math.floor(rating)))}</span>
}

/* ---------- Cards ---------- */

function MovieCard({ movie }: { movie: RecentMovie | null }) {
  if (!movie) return <EmptyCard emoji="🎬" heading="Movie night" message="No movies yet — the projector's warming up." />

  return (
    <CardShell
      href="/movies"
      emoji="🎬"
      heading="Movie night"
      accentText="text-berry-600 dark:text-berry-400"
      accentBorder="hover:border-berry-400 dark:hover:border-berry-500"
      accentShadow="hover:shadow-xl hover:shadow-berry-500/15"
      tint="from-berry-50/80 to-cream-card dark:from-berry-500/[0.09] dark:to-night-card"
      footer="All screenings"
    >
      <div className="flex gap-4">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-20 h-28 object-cover rounded-lg rotate-[-2deg] shadow-md transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold mb-2 line-clamp-2 group-hover:text-berry-600 dark:group-hover:text-berry-400 transition-colors">
            {movie.title}
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-berry-100 dark:bg-berry-500/15 text-berry-700 dark:text-berry-300">
              {movie.type}
            </span>
            <Stars rating={movie.rating} className="text-saffron-500" />
          </div>
          <p className="text-sm text-night/60 dark:text-cream/60 line-clamp-2">{movie.review}</p>
        </div>
      </div>
    </CardShell>
  )
}

function CookingCard({ dish }: { dish: RecentDish | null }) {
  if (!dish) return <EmptyCard emoji="🍳" heading="From the kitchen" message="Nothing plated yet — check back after dinner." />

  return (
    <CardShell
      href="/cooking"
      emoji="🍳"
      heading="From the kitchen"
      accentText="text-saffron-700 dark:text-saffron-400"
      accentBorder="hover:border-saffron-400 dark:hover:border-saffron-500"
      accentShadow="hover:shadow-xl hover:shadow-saffron-500/15"
      tint="from-saffron-50/90 to-cream-card dark:from-saffron-500/[0.09] dark:to-night-card"
      footer="Full menu"
    >
      <div className="flex gap-4">
        {dish.imageUrl && (
          <img
            src={dish.imageUrl}
            alt={dish.dishName}
            className="w-20 h-20 object-cover rounded-lg rotate-[2deg] shadow-md transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold mb-2 line-clamp-2 group-hover:text-saffron-700 dark:group-hover:text-saffron-400 transition-colors">
            {dish.dishName}
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-saffron-100 dark:bg-saffron-500/15 text-saffron-800 dark:text-saffron-300">
              {dish.category}
            </span>
            <Stars rating={dish.rating} className="text-saffron-500" />
          </div>
          <p className="text-sm text-night/60 dark:text-cream/60 line-clamp-2">{dish.review}</p>
        </div>
      </div>
    </CardShell>
  )
}

function BlogCard({ post }: { post: RecentPost | null }) {
  if (!post) return <EmptyCard emoji="📝" heading="Latest post" message="No posts yet — drafts are marinating." />

  return (
    <CardShell
      href={`/blog/${post.id}`}
      emoji="📝"
      heading="Latest post"
      accentText="text-ember-600 dark:text-ember-400"
      accentBorder="hover:border-ember-400 dark:hover:border-ember-500"
      accentShadow="hover:shadow-xl hover:shadow-ember-500/15"
      tint="from-ember-50/90 to-cream-card dark:from-ember-500/[0.09] dark:to-night-card"
      footer="Read more"
    >
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-32 object-cover rounded-lg mb-4 shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
        />
      )}
      <h4 className="font-bold mb-2 line-clamp-2 group-hover:text-ember-600 dark:group-hover:text-ember-400 transition-colors">
        {post.title}
      </h4>
      {post.blogType && (
        <span className="text-xs px-2 py-1 rounded-full bg-ember-100 dark:bg-ember-500/15 text-ember-700 dark:text-ember-300 mb-2 inline-block">
          {post.blogType}
        </span>
      )}
      <p className="text-sm text-night/60 dark:text-cream/60 line-clamp-3 mb-2">{post.content.substring(0, 120)}...</p>
      <p className="text-xs text-night/40 dark:text-cream/40">{new Date(post.publishDate).toLocaleDateString()}</p>
    </CardShell>
  )
}

function ProjectCard({ project }: { project: RecentProject | null }) {
  if (!project) return <EmptyCard emoji="💼" heading="On the workbench" message="No projects yet — something's compiling." />

  return (
    <CardShell
      href="/projects"
      emoji="💼"
      heading="On the workbench"
      accentText="text-sage-600 dark:text-sage-400"
      accentBorder="hover:border-sage-400 dark:hover:border-sage-500"
      accentShadow="hover:shadow-xl hover:shadow-sage-500/15"
      tint="from-sage-50/90 to-cream-card dark:from-sage-500/[0.09] dark:to-night-card"
      footer="All projects"
    >
      <h4 className="font-bold mb-3 line-clamp-2 group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors">
        {project.title}
      </h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {project.techStack?.slice(0, 3).map((tech) => (
          <span key={tech} className="text-xs px-2 py-1 rounded-full bg-sage-100 dark:bg-sage-500/15 text-sage-700 dark:text-sage-300 font-mono">
            {tech}
          </span>
        ))}
      </div>
      <p className="text-sm text-night/60 dark:text-cream/60 line-clamp-3">{project.description}</p>
    </CardShell>
  )
}

function NoteCard({ note }: { note: RecentNote | null }) {
  if (!note) return <EmptyCard emoji="📔" heading="Scribbled down" message="No notes yet — the notebook's blank." />

  return (
    <CardShell
      href="/notes"
      emoji="📔"
      heading="Scribbled down"
      accentText="text-plum-600 dark:text-plum-400"
      accentBorder="hover:border-plum-400 dark:hover:border-plum-500"
      accentShadow="hover:shadow-xl hover:shadow-plum-500/15"
      tint="from-plum-50/90 to-cream-card dark:from-plum-500/[0.09] dark:to-night-card"
      footer="All notes"
    >
      <h4 className="font-bold mb-2 line-clamp-2 group-hover:text-plum-600 dark:group-hover:text-plum-400 transition-colors">
        {note.title}
      </h4>
      {note.category && (
        <span className="text-xs px-2 py-1 rounded-full bg-plum-100 dark:bg-plum-500/15 text-plum-700 dark:text-plum-300 mb-2 inline-block">
          {note.category}
        </span>
      )}
      <p className="text-sm text-night/60 dark:text-cream/60 line-clamp-4 whitespace-pre-wrap">{note.content}</p>
    </CardShell>
  )
}
