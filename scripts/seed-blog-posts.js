// Blog Post Seed Script
// Run with: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-blog-posts.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getRandomDate(start, end) {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const randomTime = startTime + Math.random() * (endTime - startTime)
  return new Date(randomTime)
}

// Blog post topics and content
const blogPosts = [
  {
    title: "Welcome to 2025: A New Year for CRE8 Truck Club",
    content: "As we kick off 2025, the CRE8 Truck Club family continues to grow stronger than ever. This year promises to be our biggest yet with new events, member meetups, and community initiatives planned throughout Middle Tennessee. We're excited to welcome all the new members who joined us over the past few months and can't wait to see what builds everyone brings to the table.\n\nOur first official meet of the year is scheduled for later this month, and we're expecting a great turnout. Whether you're rolling in a lifted Silverado, a lowered Ram, or anything in between, there's a place for you in the CRE8 family. Stay tuned for more details and remember - it's not just about the trucks, it's about the people behind the wheel."
  },
  {
    title: "Top 5 Truck Mods That Turn Heads in Nashville",
    content: "Nashville's truck scene is as diverse as its music, and CRE8 members know how to stand out. From custom LED lighting setups that light up Broadway to suspension lifts that command attention on any highway, our members are constantly pushing the boundaries of truck customization. The most popular mods we're seeing this year include aggressive wheel and tire packages, custom exhaust systems, and professional wraps.\n\nIf you're looking to make your truck uniquely yours, consider starting with the basics - a quality set of wheels can completely transform the look of your ride. Many of our members recommend checking out local Nashville shops that specialize in truck builds. The community here is always willing to share recommendations and help newcomers find reputable installers."
  },
  {
    title: "Middle Tennessee Truck Meets: Where to Find Your Crew",
    content: "The truck community in Middle Tennessee is thriving, and there's no shortage of places to connect with fellow enthusiasts. From regular meetups in Franklin to casual hangouts in Murfreesboro, the region offers countless opportunities to show off your build and make new friends. CRE8 hosts monthly events across the Nashville metro area, ensuring members from all parts of Middle TN have access to great gatherings.\n\nBeyond our official events, many members organize impromptu cruises and parking lot hangouts. The key is staying connected through our social media channels and member communications. Some of the best friendships in our club started with a simple 'nice truck' comment at a gas station. That's the beauty of the truck community - we're always welcoming new faces."
  },
  {
    title: "Building a Truck on a Budget: Tips from CRE8 Members",
    content: "Not everyone has unlimited funds to pour into their build, and that's perfectly okay. Some of the most impressive trucks in our club were built strategically over time by members who prioritized smart spending over quick results. The key is identifying what matters most to you and focusing your budget there. Want to stand out at night? Invest in quality lighting. Prefer the aggressive look? Save up for a proper wheel and tire setup.\n\nOur experienced members often recommend buying quality parts the first time rather than replacing cheap components multiple times. It's also worth joining our community discussions where members frequently share deals they've found, group buy opportunities, and even spare parts they're looking to sell. Building a truck is a journey, not a race - enjoy the process and celebrate every upgrade along the way."
  },
  {
    title: "The History of Truck Clubs in Tennessee",
    content: "Truck clubs have been a staple of Tennessee's automotive culture for decades. What started as small groups of friends meeting at local drive-ins has evolved into organized communities with hundreds of members. The tradition of gathering to admire each other's builds, share knowledge, and form lasting friendships remains at the core of what makes truck clubs special. CRE8 carries on this tradition while bringing a fresh, modern approach to community building.\n\nThe truck culture in Tennessee has always been closely tied to the state's identity - hardworking, proud, and community-oriented. From the farms of rural Tennessee to the streets of Nashville, trucks have been an essential part of life here. Today's truck clubs honor that heritage while embracing new trends, technologies, and the diverse backgrounds of members who share a common passion for pickups."
  },
  {
    title: "Spring Cruise Planning: Routes Through Middle TN",
    content: "With warmer weather approaching, it's time to start planning spring cruises through some of Middle Tennessee's most scenic routes. The Natchez Trace Parkway offers breathtaking views and smooth pavement perfect for showing off your ride. For those who prefer a more challenging drive, the roads around Percy Warner Park provide twists and turns that make any drive memorable.\n\nCRE8 is organizing several group cruises this spring, and member input is shaping the routes we choose. Whether you prefer highway miles or backroad adventures, there's something for everyone. Group cruises are an excellent way to bond with fellow members, capture great photos of the convoy, and discover new favorite spots throughout the region. Mark your calendars and make sure your truck is ready to roll."
  },
  {
    title: "Detailing Tips: Keep Your Truck Show-Ready",
    content: "A clean truck is a happy truck, and our members take pride in keeping their rides looking sharp. Professional-level detailing doesn't require professional prices - with the right products and techniques, you can achieve stunning results at home. Start with a proper two-bucket wash method to avoid scratching your paint, follow up with clay bar treatment for that glass-smooth finish, and seal everything with a quality wax or ceramic coating.\n\nDon't forget the details that make a difference - clean wheel wells, dressed tires, and a spotless interior show that you care about every aspect of your truck. Many CRE8 members host informal detailing sessions where they share tips and products that work best for different finishes and conditions. It's a great way to learn and help each other keep the fleet looking its best."
  },
  {
    title: "Member Spotlight: Building Dreams One Mod at a Time",
    content: "Every truck in CRE8 has a story, and this month we're highlighting members who've transformed stock pickups into head-turning machines. What sets our community apart is the diversity of builds - from clean and subtle to wild and aggressive, there's no single 'right way' to build a truck. The common thread is passion and dedication to the craft.\n\nMany of our featured builds started as daily drivers that slowly evolved over months or years. Owners share that the journey of building is just as rewarding as the finished product. They've made friends along the way, learned new skills, and become part of a community that celebrates their achievements. If you've got a build you're proud of, reach out - you might be our next spotlight feature."
  },
  {
    title: "Understanding Suspension: Lifts vs. Lowering",
    content: "One of the first questions new members often ask is about suspension modifications. Do you go up or down? The answer depends entirely on your goals and preferences. Lifted trucks command presence on the road and offer practical benefits for off-road adventures. Lowered trucks hug the ground and provide a sleek, aggressive stance that turns heads at any show.\n\nBoth approaches have their considerations - lift kits may require additional modifications like driveshaft adjustments, while lowering setups need careful attention to avoid clearance issues. Our community includes experts in both styles who are always happy to share their experiences and recommendations. Before making any suspension changes, spend time at our meets talking to members with similar trucks to learn what works and what to avoid."
  },
  {
    title: "Winter Truck Care: Protecting Your Investment",
    content: "Tennessee winters may be mild compared to northern states, but they still pose challenges for truck owners. Road salt and grime can wreak havoc on undercarriages, while cold temperatures stress batteries and fluids. Taking proactive steps to protect your truck during winter months ensures it's ready to shine when spring arrives.\n\nRegular undercarriage washes are essential if you're driving on treated roads. Consider applying a rust preventative coating for extra protection. Keep your battery charged and fluids topped off, and don't skip regular wash days just because it's cold. Your truck works hard for you year-round - show it some love during the challenging months too."
  },
  {
    title: "The Best Truck Shows Coming to Tennessee in 2025",
    content: "Mark your calendars because 2025 is shaping up to be an incredible year for truck shows in Tennessee. From the massive gatherings in Pigeon Forge to local shows right here in Middle TN, there's no shortage of opportunities to display your build and connect with the broader truck community. CRE8 members regularly represent at these events, often bringing home trophies and making lasting impressions.\n\nShow season typically kicks off in early spring and runs through fall, with peak activity during the summer months. We'll be sharing details about specific events as they're announced, along with coordinating group trips for our members. There's nothing quite like the experience of rolling into a major show with your club crew, representing CRE8 and the Middle Tennessee truck scene."
  },
  {
    title: "Wheel Fitment 101: Getting the Perfect Stance",
    content: "Wheel fitment can make or break the look of your truck. Understanding offset, backspacing, and tire sizing is crucial for achieving the stance you want while maintaining proper clearance and drivability. Too aggressive and you risk rubbing issues; too conservative and you miss out on that filled-out look that turns heads.\n\nCRE8 members have experimented with countless combinations and learned valuable lessons along the way. The best advice is to research fitments from trucks similar to yours, use online fitment calculators as a starting point, and consult with experienced members before making a purchase. A proper wheel and tire setup is one of the most impactful modifications you can make - take the time to get it right."
  },
  {
    title: "Community Service: CRE8 Gives Back to Middle TN",
    content: "Being part of a truck club isn't just about the trucks - it's about being part of something bigger. CRE8 is committed to giving back to the Middle Tennessee communities that support us. Throughout the year, we organize charity events, food drives, and volunteer opportunities that allow our members to make a positive impact beyond the automotive world.\n\nOur annual toy drive has become a beloved tradition, with members loading up their truck beds with donations for local children in need. These events showcase the best of the truck community - generous, caring individuals who happen to share a love for pickups. If you're looking for a club that values community as much as chrome, you've found your crew."
  },
  {
    title: "Photography Tips: Capturing Your Truck's Best Angles",
    content: "In the age of social media, great photos of your truck can inspire others and document your build journey. You don't need professional equipment to capture stunning shots - many of our best member photos are taken with smartphones. The key is understanding lighting, angles, and backgrounds that complement your truck's features.\n\nGolden hour - the time just after sunrise or before sunset - provides the most flattering light for automotive photography. Low angles emphasize the size and stance of trucks, while shooting in interesting locations adds context and visual interest. Our members regularly share photography tips and favorite shooting spots around Middle TN. Next time you're at a meet, don't be shy about asking someone with great photos for their secrets."
  },
  {
    title: "Diesel vs. Gas: The Great Debate Continues",
    content: "It's one of the oldest debates in the truck world - diesel or gasoline? Both have their passionate supporters within CRE8, and the truth is that both have merit depending on your needs and preferences. Diesel engines offer impressive torque and fuel efficiency for heavy hauling, while gas engines provide smoother power delivery and lower upfront costs.\n\nThe modification potential differs between the two as well. Diesel trucks can see significant power gains with tuning and simple bolt-ons, while gas trucks offer a wider variety of performance parts. At the end of the day, the best engine is the one that makes you happy every time you turn the key. Our diverse membership includes both camps, and we celebrate all trucks equally."
  },
  {
    title: "Planning Your First Truck Build: Where to Start",
    content: "Starting your first truck build can feel overwhelming with so many options and directions to consider. The best advice from our experienced members is to start with a vision - what do you want your truck to look and perform like when it's 'done'? Having a clear goal helps prioritize modifications and budget effectively.\n\nMany successful builds start with the basics: wheels and tires, lighting upgrades, and minor aesthetic touches. These initial mods provide visible transformation without requiring major mechanical work. As you gain experience and resources, you can tackle more ambitious projects like suspension work or engine modifications. Remember, every incredible build started with a stock truck and a dream."
  },
  {
    title: "The Rise of Electric Trucks: What It Means for Enthusiasts",
    content: "Electric trucks are no longer a distant concept - they're on our roads and in some driveways. The Lightning, Cybertruck, Rivian, and others are changing what a truck can be. As traditional truck enthusiasts, it's natural to have mixed feelings about this shift, but there's room in the community for all types of innovation.\n\nWhat remains constant is the culture - the community gatherings, the pride of ownership, the desire to customize and personalize. Whether powered by diesel, gas, or electrons, the truck community will continue to thrive as long as people are passionate about their rides. CRE8 welcomes all trucks and looks forward to seeing how the hobby evolves in the coming years."
  },
  {
    title: "Audio Upgrades: Making Your Truck Sound as Good as It Looks",
    content: "A great sound system can transform your driving experience. Whether you're cruising down Broadway or taking a long highway trip, quality audio makes every mile more enjoyable. Modern trucks offer excellent platforms for audio upgrades, with plenty of space for amplifiers, subwoofers, and upgraded speakers.\n\nStart with a quality head unit that offers the features you want - Bluetooth, Apple CarPlay, Android Auto, and proper EQ controls make a big difference. From there, upgrade your speakers and add a subwoofer for that bass presence. Our members include several audio enthusiasts who've built competition-worthy systems and are happy to share recommendations for shops and components that deliver great results without breaking the bank."
  },
  {
    title: "Night Meets: The After-Dark Truck Scene in Nashville",
    content: "There's something magical about truck meets after the sun goes down. LED accent lighting, illuminated grilles, and the glow of modified headlights create an atmosphere unlike daytime gatherings. Nashville's night truck scene is vibrant, with regular meets drawing enthusiasts from across the region.\n\nCRE8 hosts evening events throughout the warmer months, taking advantage of cooler temperatures and the visual impact of well-lit trucks. These meets have a different energy - more relaxed, more social, with plenty of time to chat and admire builds under the lights. If you've never attended a night meet, you're missing out on a unique experience that showcases trucks in a whole new way."
  },
  {
    title: "Supporting Local: Nashville Shops That Get Trucks",
    content: "Behind every great build is a network of trusted shops and suppliers. Middle Tennessee is home to numerous businesses that specialize in truck modifications, from suspension specialists to custom fabricators. Supporting local shops means better service, easier communication, and keeping money in our community.\n\nCRE8 members have built relationships with many area shops over the years and are always willing to share recommendations. Whether you need a simple install or a complex custom project, there's likely a member who's worked with a shop that fits your needs. These connections are one of the many benefits of being part of an established truck club with deep roots in the local automotive scene."
  },
  {
    title: "Truck Camping: Adventure Awaits in Your Pickup",
    content: "Your truck isn't just for show - it's a gateway to adventure. Truck camping has exploded in popularity, and Tennessee offers incredible destinations for overnight excursions. From established campgrounds to remote overlanding spots, there's no limit to where your truck can take you.\n\nMany CRE8 members have discovered the joy of loading up their truck beds with camping gear and heading into nature. The truck community and overlanding community share many values - self-reliance, exploration, and appreciation for capable vehicles. If you've been thinking about trying truck camping, reach out to our experienced members for tips on gear, destinations, and making the most of your adventure."
  },
  {
    title: "Protecting Your Truck: Security Tips for Enthusiasts",
    content: "Unfortunately, modified trucks can be targets for theft. Protecting your investment requires a multi-layered approach that deters criminals and provides peace of mind. From basic practices like parking in well-lit areas to advanced solutions like GPS trackers and immobilizers, there are many ways to secure your ride.\n\nOur members have learned from experience - both their own and others' - about effective security measures. Steering wheel locks provide visible deterrence, while aftermarket alarm systems add another layer of protection. Some members even use AirTags or similar trackers hidden in their trucks for recovery assistance. The key is making your truck a harder target than the next one."
  },
  {
    title: "The Art of Debadging: Clean Looks for Your Truck",
    content: "Sometimes less is more. Debadging - removing manufacturer emblems and badges - has become a popular modification for trucks seeking a cleaner, more custom appearance. When done properly, the result is a sleek look that emphasizes the lines of your truck without distracting text and logos.\n\nThe process requires patience and the right tools to avoid damaging paint. Heat guns, fishing line, and adhesive remover are the basic arsenal for badge removal. Many CRE8 members have experience with this modification and can offer tips for your specific truck. It's a relatively low-cost modification that can dramatically change the appearance of your vehicle."
  },
  {
    title: "Family and Trucks: Involving Everyone in the Hobby",
    content: "The truck hobby doesn't have to be a solo pursuit. Many CRE8 members involve their entire families in meets, cruises, and build projects. Kids especially love trucks, and involving them in age-appropriate tasks like washing and basic maintenance can create lasting memories and teach valuable skills.\n\nOur family-friendly events provide safe, welcoming environments for members of all ages. Spouses and partners often become enthusiasts themselves after spending time in the community. The friendships formed in truck clubs extend to entire families, creating social networks that go far beyond a shared interest in pickups. It's one of the most rewarding aspects of club membership."
  },
  {
    title: "Towing and Hauling: Using Your Truck for What It's Built For",
    content: "Trucks are meant to work, and using yours for towing and hauling is nothing to be ashamed of - even if it's modified. Many CRE8 members regularly tow trailers, haul equipment, and put their trucks to practical use. The key is understanding your truck's capabilities and making modifications that enhance rather than compromise its utility.\n\nIf you're planning to tow with a modified truck, pay attention to suspension components that can handle the added stress. Exhaust modifications should be compatible with towing heat, and cooling upgrades might be necessary for heavy-duty use. Our members who tow regularly can share insights about what works and what to avoid for the best of both worlds."
  },
  {
    title: "The Perfect Tailgate: Hosting Events at Meets",
    content: "CRE8 meets are about more than just trucks - they're social gatherings where food, music, and conversation flow freely. The art of the tailgate has been perfected by our members over years of hosting and attending events. A well-planned setup can become the gathering spot for the entire meet.\n\nEssentials include quality coolers, comfortable seating options, and something to share with fellow enthusiasts. Some members go all out with portable grills, sound systems, and custom setups that show as much creativity as their truck builds. The tailgate culture adds another dimension to the truck hobby and creates memories that last long after the parking lot empties."
  },
  {
    title: "Off-Road Adventures: Tennessee Trails for Trucks",
    content: "Tennessee offers excellent off-road opportunities for trucks equipped to handle the trails. From the challenging terrain of Windrock to more accessible trails throughout the region, there's no shortage of places to get your truck dirty. Off-roading builds skills, tests equipment, and provides pure driving enjoyment.\n\nNot all CRE8 trucks are built for off-road duty, but those that are regularly organize trail runs and adventures. These trips offer a different kind of camaraderie - helping each other through obstacles, sharing the triumph of conquering challenging terrain, and enjoying the natural beauty of Tennessee's wilderness. If you're interested in off-roading, our experienced members can help you understand what modifications might be needed for your truck."
  },
  {
    title: "Insurance Considerations for Modified Trucks",
    content: "Modifying your truck affects its value and risk profile, which has implications for insurance. Standard policies may not cover the full value of your modifications, leaving you underprotected in case of an accident or theft. Understanding your coverage options is an important part of responsible truck ownership.\n\nSome insurance companies offer agreed-value policies or specific modifications coverage that provides better protection for built trucks. Documenting your modifications with photos and receipts helps establish their value. Our members have experience with various insurance providers and can share recommendations for companies that understand the enthusiast market and offer appropriate coverage options."
  },
  {
    title: "The Evolution of Truck Design: Past, Present, and Future",
    content: "Truck design has come a long way from the simple workhorses of decades past. Today's trucks blend capability with technology, comfort, and style in ways that previous generations couldn't imagine. Looking back at the evolution helps us appreciate where we are and hints at where we're heading.\n\nCRE8 celebrates trucks from all eras. Classic square bodies share meet space with the latest models, each representing a chapter in truck history. The enthusiast community keeps older trucks alive through restoration and modernization while embracing new developments. Whatever era speaks to you, there's a place for your passion in the truck community."
  },
  {
    title: "Social Media and the Truck Community",
    content: "Instagram, Facebook, TikTok - social media has transformed how truck enthusiasts connect and share their builds. A great post can reach thousands of fellow enthusiasts, inspiring others and building your reputation in the community. But social media is just one tool in the truck enthusiast's toolkit.\n\nThe real connections happen in person, at meets and events where you can see trucks up close and have genuine conversations. CRE8 uses social media to coordinate events and share member content, but we never lose sight of the importance of face-to-face community. Follow us on your preferred platforms, but make sure to show up to meets - that's where the magic happens."
  },
  {
    title: "Performance Upgrades: Getting More From Your Engine",
    content: "While appearance modifications get a lot of attention, performance upgrades are equally popular among CRE8 members. Intake, exhaust, and tuning improvements can unlock hidden potential in your truck's engine, providing more power and better throttle response. The key is choosing modifications that work well together.\n\nBefore diving into performance mods, consider your goals and budget. Are you looking for a modest improvement in daily driving feel, or are you chasing maximum power numbers? Different approaches call for different strategies. Our performance-minded members have been through various build paths and can share what worked - and what wasn't worth the investment."
  },
  {
    title: "Maintaining Older Trucks: Tips for Classic Owners",
    content: "Older trucks have a special place in the CRE8 family. Whether you're keeping a classic running as a daily driver or restoring one to show quality, maintaining an aging vehicle presents unique challenges. Parts availability, rust prevention, and period-correct modifications are constant considerations.\n\nThe rewards of old truck ownership are worth the effort. Nothing turns heads quite like a well-maintained classic pickup, and the simplicity of older designs makes DIY maintenance more accessible. Our classic truck owners form a supportive sub-community within CRE8, sharing sources for parts, restoration tips, and the joy of keeping automotive history alive."
  },
  {
    title: "Meet Etiquette: How to Make the Best Impression",
    content: "Whether you're new to truck meets or a seasoned veteran, good etiquette helps everyone have a better experience. Simple things like arriving with a clean truck, respecting others' personal space, and engaging positively with fellow enthusiasts go a long way. CRE8 meets are welcoming environments, but knowing the unwritten rules helps you fit right in.\n\nDon't be afraid to approach other owners and compliment their builds - it's the best ice breaker in the truck community. Ask questions if you're curious about a modification, but avoid touching vehicles without permission. Park where directed, clean up after yourself, and represent the club well. These basics help maintain our reputation and ensure we're always welcome back."
  },
  {
    title: "Custom Fabrication: When Off-the-Shelf Won't Cut It",
    content: "Sometimes your vision requires parts that don't exist. That's where custom fabrication comes in. From one-off bumpers to completely unique bed setups, skilled fabricators can turn your ideas into reality. Middle Tennessee has talented metalworkers who specialize in automotive projects.\n\nCustom work costs more than off-the-shelf parts, but the result is truly one-of-a-kind. Before pursuing custom fabrication, have clear designs or references to communicate your vision. The best fabricators will offer suggestions to improve function and durability while maintaining your aesthetic goals. Check out builds from their previous customers before committing to a project."
  },
  {
    title: "Truck Financing: Smart Money Moves for Enthusiasts",
    content: "Whether you're buying a new truck or financing modifications, understanding your options helps you make smart decisions. Interest rates, loan terms, and payment structures vary significantly between lenders. Taking time to shop around can save thousands of dollars over the life of a loan.\n\nCredit unions often offer competitive rates for vehicle purchases and even some modifications. Personal lines of credit can provide flexibility for build projects. Whatever your financing approach, stay within your means - a truck you can't afford isn't worth the stress. Our members have navigated various financial situations and can share perspectives on managing build budgets responsibly."
  },
  {
    title: "The CRE8 Difference: What Makes Our Club Special",
    content: "Truck clubs come and go, but CRE8 has built something lasting. What makes us different isn't any single thing - it's the combination of passionate members, quality events, community focus, and genuine friendships that develop over time. We're not just a club; we're a family bound by a common love of trucks.\n\nOur members come from all walks of life, drive all types of trucks, and bring diverse perspectives to the community. What unites us is stronger than any differences. If you're looking for a truck club that values people as much as pickups, that celebrates all builds without judgment, and that gives back to the community, you've found your home with CRE8."
  },
  {
    title: "LED Lighting: Brightening Up Your Build",
    content: "LED technology has revolutionized truck lighting. From replacement headlights that improve visibility to accent lighting that adds personality, LEDs offer efficiency and style that traditional bulbs can't match. The variety of products available means there's an LED solution for every need and budget.\n\nQuality matters with LEDs - cheap products can be unreliable or produce unpleasant light colors. Our members have tested many brands and can recommend products that deliver on their promises. Installation varies from simple plug-and-play to complex wiring projects, so know what you're getting into before purchasing. The right lighting upgrades can transform both the look and functionality of your truck."
  },
  {
    title: "Seat Covers and Interior Mods: Comfort Meets Style",
    content: "Your truck's interior is where you spend all your driving time, so why not make it comfortable and personalized? Custom seat covers, floor mats, and interior accessories let you put your stamp on the cabin while protecting factory surfaces. The options range from subtle improvements to complete interior overhauls.\n\nConsider your actual use when planning interior modifications. Daily drivers benefit from durable, easy-to-clean materials. Show trucks might prioritize appearance over practicality. Many CRE8 members have found a middle ground that looks great while standing up to real-world use. Don't overlook the interior when planning your build - it's a big part of the overall experience."
  },
  {
    title: "Truck Photography Locations Around Nashville",
    content: "Nashville and the surrounding area offer countless perfect backdrops for truck photography. Urban settings downtown provide industrial contrast, while rural locations showcase trucks in their natural element. Knowing where to shoot helps you capture images that do your build justice.\n\nSome favorite spots among CRE8 members include areas around the Gulch, scenic overlooks on the Natchez Trace, and various abandoned or industrial locations that provide interesting backgrounds. Always respect private property and obtain permission when needed. The hunt for the perfect photo location is part of the fun - you'll discover amazing spots you never knew existed."
  },
  {
    title: "Wrap vs. Paint: Making the Right Choice for Your Truck",
    content: "Changing your truck's color is a major decision, and you have two main options: traditional paint or modern vinyl wrap. Each approach has advantages and drawbacks worth considering. Paint offers unmatched depth and durability but is permanent and expensive. Wraps provide flexibility and protection but require maintenance and eventual replacement.\n\nMany CRE8 members have experience with both options and can share their honest assessments. The right choice depends on your budget, timeline, and long-term plans for the truck. Some members use wraps to test colors before committing to paint, while others prefer the ability to change looks without permanent modification. Both can produce stunning results in the right hands."
  },
  {
    title: "Track Days: Testing Your Truck's Limits Safely",
    content: "Want to know what your truck can really do? Track days offer a controlled environment to push limits that would be unsafe on public roads. While trucks aren't traditional track vehicles, the experience of driving at the limit helps you understand your vehicle's capabilities and improve your skills.\n\nSeveral tracks in the Tennessee region host open track events that welcome trucks. It's an eye-opening experience that builds appreciation for your truck's engineering and your own abilities behind the wheel. Our members who've participated in track days report that it changes how they drive on the street - with more confidence and better judgment."
  },
  {
    title: "Tonneau Covers: Function and Form for Your Bed",
    content: "A tonneau cover is one of the most practical additions you can make to your truck. Beyond the improved fuel efficiency and weather protection, modern covers come in styles that enhance your truck's appearance. Roll-up, folding, and retractable options each offer different balances of access and security.\n\nConsider how you actually use your truck bed when choosing a cover. Do you need frequent full access, or is security more important? Do you haul tall items regularly? The answers guide you toward the right style. Our members have tested many brands and styles and can share real-world experiences about durability, ease of use, and value."
  },
  {
    title: "The Future of CRE8: Growing Our Community",
    content: "As we look ahead, CRE8's mission remains clear: build a community where truck enthusiasts can connect, share, and celebrate their passion. Our growth over the past years has been organic - driven by members who love what we're about and spread the word to friends who share their interests.\n\nWe're always looking for ways to provide more value to our members while staying true to our roots. New events, partnerships with local businesses, and enhanced member benefits are on the horizon. But the core of CRE8 - the people - will always be our focus. Thank you for being part of this journey, and here's to many more miles together."
  },
  {
    title: "Tire Technology: Understanding What's Under Your Truck",
    content: "Tires are the only part of your truck that actually touches the road, making them critically important for performance, safety, and appearance. The tire market offers overwhelming choices, from aggressive mud terrains to refined highway all-seasons. Understanding tire specifications helps you make informed decisions.\n\nLoad ratings, speed ratings, tread patterns, and compound compositions all affect how a tire performs. Our members have experience with most major brands and can share honest assessments of wear life, performance, and value. Don't overlook tire care either - proper inflation, rotation, and alignment extend tire life and optimize performance."
  },
  {
    title: "DIY vs. Professional Installation: Making the Call",
    content: "Every truck owner faces this question with each modification: do it yourself or pay someone else? The answer depends on your skills, tools, time, and comfort level. Some mods are perfect for DIY - learning as you go builds knowledge and saves money. Others are better left to professionals who have the equipment and experience to do the job right.\n\nStart with simpler projects to build confidence before tackling complex installations. Understand that professional shops offer warranties on their work, which provides peace of mind for critical installations. There's no shame in admitting when a job is beyond your abilities - even experienced members outsource certain work. The goal is enjoying your truck, however you get there."
  },
  {
    title: "Celebrating Milestones: CRE8 Member Achievements",
    content: "Throughout the year, CRE8 members achieve impressive milestones in their builds and the broader truck community. Show wins, completed restorations, personal build goals reached - these achievements deserve recognition and celebration. Our community lifts each other up, taking pride in each member's success.\n\nThis month we celebrate several members who've reached significant milestones. Their dedication inspires us all and demonstrates what's possible when passion meets persistence. If you're working toward a goal with your build, know that your CRE8 family is cheering you on. Share your progress, ask for help when needed, and celebrate when you get there."
  },
  {
    title: "Spring Maintenance Checklist for Your Truck",
    content: "As winter fades and spring arrives, it's time to give your truck some attention after the cold months. A thorough spring cleaning and inspection helps catch issues before they become problems and gets your truck ready for the busy season of shows and meets ahead.\n\nStart with a comprehensive wash, including the undercarriage where winter grime accumulates. Check fluid levels, inspect belts and hoses, and assess tire condition. Clean and treat interior surfaces that may have suffered from winter boots and moisture. A little time now prevents headaches later and ensures your truck looks its best for upcoming events."
  },
  {
    title: "Understanding Truck Towing Ratings and Capabilities",
    content: "If you tow with your truck - or plan to - understanding ratings is essential for safety. Payload capacity, towing capacity, and tongue weight limits are more than just numbers; they represent engineering constraints that protect you and your equipment. Exceeding these limits risks damage, control issues, and accidents.\n\nModifications can affect these ratings, both positively and negatively. Suspension upgrades might increase capability, while added weight from accessories reduces payload. Know your truck's specifications and stay within them. Our members who tow regularly can share practical insights about loading, driving techniques, and equipment that makes towing safer and easier."
  },
  {
    title: "The Joy of the Cruise: Why Driving Matters",
    content: "At the end of the day, all the modifications and meets exist to serve one purpose: the joy of driving a truck you love. There's nothing quite like firing up your engine, feeling the power at your command, and heading out on the open road. The destination matters less than the journey.\n\nCRE8 members understand this deeply. We build our trucks not just to look at, but to drive. Sunday cruises, impromptu highway pulls, quiet late-night drives - these moments remind us why we fell in love with trucks in the first place. Never lose sight of the simple pleasure of driving. It's the heartbeat of everything we do."
  }
]

async function seedBlogPosts() {
  console.log('Starting blog post seed...')

  // Date range: Jan 1, 2025 to Jan 5, 2026
  const startDate = new Date('2025-01-01')
  const endDate = new Date('2026-01-05')

  // Sort by date for publication order
  const postsWithDates = blogPosts.map((post, index) => {
    // Distribute dates across the range
    const dateProgress = index / (blogPosts.length - 1)
    const date = new Date(startDate.getTime() + dateProgress * (endDate.getTime() - startDate.getTime()))

    // Add some randomness to time
    date.setHours(Math.floor(Math.random() * 14) + 8) // 8 AM to 10 PM
    date.setMinutes(Math.floor(Math.random() * 60))

    return {
      ...post,
      published_at: date.toISOString()
    }
  })

  // Create excerpt from content if not present
  const postsToInsert = postsWithDates.map(post => {
    const excerpt = post.content.split('\n')[0].substring(0, 200)
    return {
      title: post.title,
      slug: generateSlug(post.title),
      content: post.content,
      excerpt: excerpt,
      image_url: null, // Will be updated when photos are uploaded
      author_id: null, // Will be set to an admin if needed
      is_published: true,
      is_pinned: false,
      published_at: post.published_at,
    }
  })

  // Insert in batches
  const batchSize = 10
  for (let i = 0; i < postsToInsert.length; i += batchSize) {
    const batch = postsToInsert.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(batch)
      .select()

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} posts)`)
    }
  }

  console.log('Blog post seed complete!')
  console.log(`Total posts created: ${postsToInsert.length}`)
}

seedBlogPosts().catch(console.error)
