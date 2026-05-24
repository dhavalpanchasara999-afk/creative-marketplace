// --- DIGITIZER LANDING PAGE CONFIGURATION ---
// Customize this file to change any text, prices, images, colors, or features on your landing page.

const SITE_CONFIG = {
    // 1. BRANDING & BASIC INFO
    siteName: "Digitizer",
    siteUrl: "digitizer.in",
    supportEmail: "support@digitizer.in",
    currencySymbol: "₹",
    paymentUrl: "https://rzp.io/l/your-payment-link", // Replace with your Razorpay / Instamojo checkout link

    // 2. THEME & COLORS
    theme: {
        primaryColor: "#FFEA00",      // Vibrant Gold/Yellow for key highlights
        secondaryColor: "#00FF66",    // Neon Green for prices/success badges
        accentColor: "#EF4444",       // Vivid Red for countdown timer and CTA buttons
        backgroundColor: "#0B0E17",   // Deep Space Black/Blue for main background
        bgCardColor: "#161D30",       // Sleek Card background
        bgDarkGreen: "#0C231A",       // Rich Green background for the included lists section
        fontFamily: "'Outfit', sans-serif"
    },

    // 3. ANNOUNCEMENT BAR
    announcement: {
        text: "🚨 Limited Period Offer- Next Price Will be ₹ 499/-. Grab It Now! 🚨",
        backgroundColor: "#EF4444",
        textColor: "#FFFFFF"
    },

    // 4. HERO SECTION
    hero: {
        title: "Transform <span class='highlight-yellow'>Your Life</span> With Our <span class='highlight-yellow'>Exclusive</span> Digital Bundle!",
        subtitle: "1200+ Best-Selling eBooks & 1000+ Life-Changing Audiobooks",
        rocketText: "🚀 Dive into our curated collection of bestselling ebooks to revolutionize your mindset, finance, health, and career starting today!",
        heroCollageTitle: "Ultimate Ebook & Audiobook Pack",
        bullets: [
            { icon: "📚", text: "1200+ Best Selling eBooks in multiple categories" },
            { icon: "▶️", text: "1000+ Highly engaging Audiobooks for learning on-the-go" },
            { icon: "📖", text: "Fully compatible with Mobile, Kindle, Tablets, and PC" },
            { icon: "✅", text: "One-Time Payment - No monthly subscriptions" },
            { icon: "🚀", text: "Instant Google Drive Download link sent directly to email" },
            { icon: "🔠", text: "Language: English & easy-to-read translations" },
            { icon: "📱", text: "Read offline anytime, anywhere, for the rest of your life" },
            { icon: "❎", text: "No ads, no watermarks, fully high-quality PDF/EPUB formats" },
            { icon: "⌛", text: "Lifetime Access with future updates included FREE" }
        ]
    },

    // 5. URGENCY & PRICING
    pricing: {
        salePrice: 249,
        originalPrice: 217800, // Anchored value of all courses/ebooks combined
        nextPrice: 499,
        countdownMinutes: 10,  // Ticking countdown duration
        ctaButtonText: "GET INSTANT ACCESS NOW",
        ctaSubtext: "⚡ Instant Download • Secure Checkout • Lifetime Access",
        secureText: "🔒 SSL Encrypted & 100% Safe Payments via UPI, Cards, NetBanking"
    },

    // 6. PRODUCT SHOWCASE (What is inside)
    whatYouGet: {
        title: "WHAT YOU WILL GET... LIST OF POPULAR BOOKS",
        subtitle: "Below is a sneak peek of the high-value bestseller books included in the bundle",
        books: [
            "Rich Dad Poor Dad by Robert Kiyosaki",
            "The Psychology of Money by Morgan Housel",
            "Think and Grow Rich by Napoleon Hill",
            "IKIGAI - The Japanese Secret to a Long and Happy Life",
            "Atomic Habits by James Clear",
            "The 5 AM Club by Robin Sharma",
            "The Alchemist by Paulo Coelho",
            "Zero to One by Peter Thiel",
            "The Subtle Art of Not Giving a F*ck by Mark Manson",
            "Start With Why by Simon Sinek",
            "How to Win Friends and Influence People by Dale Carnegie",
            "The Power of Your Subconscious Mind by Joseph Murphy",
            "Man's Search for Meaning by Viktor Frankl",
            "Elon Musk by Walter Isaacson",
            "Deep Work by Cal Newport",
            "The $100 Startup by Chris Guillebeau",
            "Can't Hurt Me by David Goggins",
            "Show Your Work! by Austin Kleon",
            "Monk Who Sold His Ferrari by Robin Sharma",
            "Rework by Jason Fried & David Heinemeier Hansson",
            "The Intelligent Investor by Benjamin Graham",
            "Eat That Frog! by Brian Tracy",
            "Influence: The Psychology of Persuasion",
            "The Miracle Morning by Hal Elrod"
        ]
    },

    // 7. GENRES INCLUDED
    genres: {
        title: "BOOKS GENRES INCLUDED IN THIS MASSIVE BUNDLE",
        list: [
            { icon: "💰", name: "Business & Finance" },
            { icon: "🧠", name: "Self Improvement & Mindset" },
            { icon: "🚀", name: "Startup & Entrepreneurship" },
            { icon: "⏰", name: "Productivity & Time Management" },
            { icon: "📈", name: "Marketing & Sales Mastery" },
            { icon: "🤝", name: "Communication & Relationships" },
            { icon: "🧘", name: "Mental Health & Spiritual Growth" },
            { icon: "🍏", name: "Health, Fitness & Longevity" },
            { icon: "📖", name: "Biographies & Success Stories" },
            { icon: "🎭", name: "Creativity, Writing & Design" },
            { icon: "🎯", name: "Goal Setting & Motivation" },
            { icon: "🛡️", name: "Leadership & Strategy" }
        ]
    },

    // 8. WHY YOU NEED THIS SECTION
    whyNeed: {
        title: "Why You Need This Bundle In Your Life ?",
        cards: [
            {
                icon: "🎓",
                title: "Lifelong Wisdom",
                desc: "Gain access to lifetimes of wisdom from world-class experts in business, finance, psychology, and personal development in just a few minutes of reading a day."
            },
            {
                icon: "⚡",
                title: "Accelerated Success",
                desc: "Instead of wasting years learning through trial and error, model the habits, strategies, and minds of billionaires and high-achievers who have already walked the path."
            },
            {
                icon: "🛡️",
                title: "Mental Armor & Peace",
                desc: "Read books designed to reduce anxiety, build stoicism, boost self-confidence, and give you clear frameworks to face any personal or professional challenge."
            }
        ]
    },

    // 9. CONTRAST DECISION FRAME (Two Options)
    contrast: {
        title: "YOU HAVE TWO OPTIONS NOW!",
        option1: {
            title: "Option #1: Buy Single eBook on Amazon",
            priceText: "₹ 361/-",
            desc: "Buy just one single bestseller ebook like *Rich Dad Poor Dad* or *Psychology of Money* on Amazon. You pay more for just one copy than our entire library.",
            amazonImg: "https://images-na.ssl-images-amazon.com/images/I/81bsw6fnUiL.jpg" // Rich Dad Poor Dad
        },
        option2: {
            title: "Option #2: Buy 1200+ eBooks & 1000+ Audiobooks Bundle",
            priceText: "₹ 249/- Only",
            desc: "Get lifetime access to the entire mega library of 1,200+ bestseller eBooks, 1,000+ premium audiobooks, and 4 major bonuses instantly today."
        }
    },

    // 10. BONUS STACK (Perceived value additions)
    bonuses: {
        title: "Order Today and Unlock Bonuses Worth ₹ 5,000/- For FREE!",
        list: [
            {
                badge: "Bonus #1 (Value ₹1,999)",
                title: "Productivity & Time Management Video Course",
                desc: "Complete video training course (in English) with actionable frameworks to double your focus, eliminate procrastination, and plan your day like high-level CEOs."
            },
            {
                badge: "Bonus #2 (Value ₹1,299)",
                title: "Time Mastery Combo (4 Exclusive eBooks)",
                desc: "A highly curated collection of 4 masterclass guides detailing the secrets of time scheduling, focus-blocking, habit integration, and routine optimization."
            },
            {
                badge: "Bonus #3 (Value ₹999)",
                title: "How to Master Your Communication Skills",
                desc: "An actionable, step-by-step guidebook explaining how to negotiate, speak in public with high confidence, win over clients, and express your ideas clearly."
            },
            {
                badge: "Bonus #4 (Value ₹799)",
                title: "The Ultimate Cold Email & Copywriting Book",
                desc: "Fill-in-the-blank email and sales letter templates that convert cold prospects into high-paying clients, written by elite copywriters."
            }
        ]
    },

    // 11. SOCIAL PROOF (Testimonials)
    reviews: {
        title: "Read Our Customer Reviews",
        list: [
            {
                name: "Anand Verma",
                location: "Bengaluru, Karnataka",
                rating: 5,
                text: "Absolutely mind-blowing collection! The download was instant. I got a Google Drive link containing clean folder organization. The audiobooks are perfect while driving to work. Best ₹249 I have ever spent!"
            },
            {
                name: "Rohan Das",
                location: "Kolkata, West Bengal",
                rating: 5,
                text: "I was skeptical because of the extremely low price, but it is 100% legit. Got popular books like Psychology of Money, Atomic Habits, and dozens of others. Highly recommend to anyone wanting to build a reading habit."
            },
            {
                name: "Sneha Reddy",
                location: "Hyderabad, Telangana",
                rating: 5,
                text: "The collection covers everything from business strategy, trading, marketing, to spiritual growth. The bonuses alone are worth much more. Excellent support, got my link within 10 seconds of UPI payment."
            },
            {
                name: "Vikram Malhotra",
                location: "Mumbai, Maharashtra",
                rating: 5,
                text: "Beautifully organized. It was always a chore to find books one by one, but having a curated library on my drive is a game-changer. Works perfectly on my Kindle and Android tablet."
            }
        ]
    },

    // 12. FAQ ACCORDION
    faqs: [
        {
            q: "How and when will I receive the books?",
            a: "Immediately after successful payment, you will be redirected to the download page and receive an automated email containing a Google Drive Link. You can download all files or save them to your own Google Drive."
        },
        {
            q: "Are these files compatible with my device?",
            a: "Yes! All eBooks are in standard PDF and EPUB formats, and Audiobooks are in high-quality MP3 format. They work flawlessly on iPhones, Android devices, iPads, Kindle, Tablets, Laptops, and PCs."
        },
        {
            q: "Why is the price so low (₹ 249)?",
            a: "Our core mission at Digitizer is to make high-value education, business wisdom, and life-changing self-growth literature accessible to everyone in India. Instead of charging high prices to a few, we charge a very low cost to thousands of readers."
        },
        {
            q: "Is the payment secure?",
            a: "Absolutely! We use industry-standard encrypted payment gateways (supporting UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards, and NetBanking). Your details are completely secure and SSL encrypted."
        },
        {
            q: "Is there a monthly subscription fee?",
            a: "No! This is a strict one-time payment of ₹ 249/-. You will get lifetime access to all 1200+ eBooks, 1000+ Audiobooks, and all future updates and additions absolutely free."
        },
        {
            q: "What if I face an issue with the download?",
            a: "We have dedicated customer support. If you face any issues with payment or downloading the files, simply email us at support@digitizer.in, and our team will resolve it within 1 to 2 hours."
        }
    ],

    // 13. FOOTER INFO
    footer: {
        tagline: "Empowering minds in India with world-class digital libraries at the absolute lowest cost.",
        disclaimer: "Disclaimer: digitizer.in is an independent platform. This site is not a part of the Facebook website or Meta Platforms, Inc. Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of META Platforms, Inc. All trademarks and registered trademarks are the property of their respective owners.",
        copyright: "© 2026 Digitizer. All rights reserved."
    }
};
