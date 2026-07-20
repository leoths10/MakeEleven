interface SilhouetteJoueurProps {
  className?: string
}

export default function SilhouetteJoueur({ className }: SilhouetteJoueurProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="10" r="6" />
      <path d="M24 18c-4.5 0-8 2.6-9 6.8l-3.2 6.4a2.2 2.2 0 0 0 3.9 2l2.9-5.8.7 3.6-3.6 12.6a2.4 2.4 0 0 0 4.6 1.3l3.2-11.1h1l3.2 11.1a2.4 2.4 0 0 0 4.6-1.3l-3.6-12.6.7-3.6 2.9 5.8a2.2 2.2 0 0 0 3.9-2l-3.2-6.4c-1-4.2-4.5-6.8-9-6.8z" />
    </svg>
  )
}
