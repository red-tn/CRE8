import { Crown, Target, Heart, Zap, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata = {
  title: 'About | CRE8 Truck Club',
  description: 'Learn about CRE8 Truck Club - the edgiest truck club for young enthusiasts.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            ABOUT <span className="text-amber-500">CRE8</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            We&apos;re not your typical truck club. We&apos;re a community of enthusiasts
            who live for the build, the drive, and the brotherhood.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                OUR <span className="text-amber-500">STORY</span>
              </h2>
              <p className="text-zinc-400 mb-4">
                CRE8 was born in 2025 from a simple frustration - there wasn&apos;t a truck club
                that felt right. Everything out there was either too corporate, too gatekeepy,
                or just didn&apos;t understand what we were about.
              </p>
              <p className="text-zinc-400 mb-4">
                So we built our own. A community where truck enthusiasts could connect, show off
                their builds, roll out to events together, and actually enjoy the culture without
                all the nonsense.
              </p>
              <p className="text-zinc-400">
                The name? CRE8. Because that&apos;s what we do - we create builds, create memories,
                create a movement. And the crown? That&apos;s because every member here is royalty.
                No exceptions.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 aspect-video flex items-center justify-center">
              <Crown className="w-24 h-24 text-zinc-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              WHAT WE <span className="text-amber-500">STAND FOR</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black border border-zinc-800 p-8 text-center">
              <Target className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Authenticity</h3>
              <p className="text-zinc-500 text-sm">
                No posers. No fakes. Just real enthusiasts who live for their trucks.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 p-8 text-center">
              <Heart className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-zinc-500 text-sm">
                We look out for each other. Need help with a build? We got you.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 p-8 text-center">
              <Zap className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Energy</h3>
              <p className="text-zinc-500 text-sm">
                We stay active. Weekly meets, monthly events, constant engagement.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 p-8 text-center">
              <Users className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Inclusivity</h3>
              <p className="text-zinc-500 text-sm">
                Chevy, Ford, Dodge - we don&apos;t discriminate. All trucks welcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-zinc-900 border border-zinc-800 p-8">
              <h3 className="text-2xl font-bold mb-6 text-amber-500">Member Benefits</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                  <span className="text-zinc-400">Access to exclusive member-only events</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                  <span className="text-zinc-400">Discounted pricing on all merchandise</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                  <span className="text-zinc-400">Your truck featured in the fleet gallery</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                  <span className="text-zinc-400">Priority registration for popular events</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                  <span className="text-zinc-400">Access to member-only Discord channels</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                  <span className="text-zinc-400">Voting rights on club decisions</span>
                </li>
              </ul>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                <span className="text-amber-500">$50</span>/YEAR
              </h2>
              <p className="text-zinc-400 mb-6">
                That&apos;s it. No hidden fees. No BS. Just $50 a year gets you full access
                to everything CRE8 has to offer.
              </p>
              <p className="text-zinc-500 mb-8">
                Membership is invite-only. Know a member? Ask them for a code. Don&apos;t know
                anyone? Hit us up on Instagram and tell us about your build.
              </p>
              <Link href="/signup">
                <Button size="lg">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">
            <span className="text-amber-500">FAQ</span>
          </h2>

          <div className="space-y-6">
            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-2">Who can join CRE8?</h3>
              <p className="text-zinc-500">
                Anyone who&apos;s passionate about trucks and vibes with our community. It&apos;s
                about attitude and enthusiasm, not demographics.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-2">What trucks are allowed?</h3>
              <p className="text-zinc-500">
                Chevy, Ford, and Dodge pickups. Any year, any model. Lifted, lowered, stock,
                modded - we love them all.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-2">How do I get an invite code?</h3>
              <p className="text-zinc-500">
                Ask a current member, or DM us on Instagram @cre8truckclub with pics of your
                build. We&apos;ll hook you up.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-2">Where are you located?</h3>
              <p className="text-zinc-500">
                We&apos;re based in Middle Tennessee but have members nationwide. Most events are in the
                Nashville area, but we&apos;re expanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            READY TO <span className="text-amber-500">JOIN</span>?
          </h2>
          <p className="text-zinc-400 mb-8">
            Stop scrolling. Start creating. Become part of the crew.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Join the Club</Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" size="lg">Check Out Events</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
