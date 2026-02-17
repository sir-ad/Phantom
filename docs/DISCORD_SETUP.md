# PHANTOM Discord Community Setup

Complete guide for setting up and managing the PHANTOM Discord community server.

## Server Setup

### 1. Create Discord Server

1. Open Discord (web or app)
2. Click "+" to add server
3. Select "Create My Own"
4. Choose "For a club or community"
5. Name it: "PHANTOM"
6. Upload server icon (logo)

### 2. Server Settings

**Overview:**
- Server Name: PHANTOM
- Icon: Phantom logo (512x512px)
- Splash Background: Banner image (1920x1080px)
- Server Description: "The invisible force behind every great product. Open-source PM operating system."
- Default Notification Settings: Only @mentions

**Moderation:**
- Verification Level: Medium (email required)
- 2FA Requirement: For Moderator+ roles
- Explicit Content Filter: Scan media from all members

**Community Settings:**
- Enable Community: ON
- Rules Channel: #rules
- Updates Channel: #announcements
- Safety Setup: Review and configure

## Channel Structure

### Category: 📢 INFORMATION

**#welcome**
- Purpose: Welcome new members
- Content: Server rules, quick start guide
- Permissions: Read-only for @everyone

**#rules**
- Purpose: Community guidelines
- Content: Code of conduct, moderation policy
- Pin message with full rules

**#announcements**
- Purpose: Official announcements
- Content: Releases, updates, events
- Permissions: Post only by @Admin @Moderator

**#releases**
- Purpose: New version announcements
- Content: Changelog highlights, download links

### Category: 💬 GENERAL

**#general**
- Purpose: General discussion
- Content: Anything PHANTOM-related

**#introductions**
- Purpose: New member introductions
- Content: Who you are, what you build
- Pin template message

**#showcase**
- Purpose: Share projects using PHANTOM
- Content: Demos, screenshots, success stories

**#random**
- Purpose: Off-topic discussion
- Content: Non-PHANTOM chat

### Category: 🛠️ SUPPORT

**#help**
- Purpose: General help and questions
- Content: Installation, usage, troubleshooting

**#troubleshooting**
- Purpose: Technical issues
- Content: Bug reports, error messages

**#feature-requests**
- Purpose: Suggest new features
- Content: Ideas, use cases, proposals

### Category: 👥 DEVELOPMENT

**#contributors**
- Purpose: Contributor discussion
- Content: PR reviews, architecture decisions

**#module-development**
- Purpose: Building PHANTOM modules
- Content: Module ideas, development help

**#architecture**
- Purpose: Technical architecture discussion
- Content: Core system design

**#good-first-issues**
- Purpose: Help newcomers contribute
- Content: Beginner-friendly tasks

### Category: 🎯 SPECIAL

**#beta-testing**
- Purpose: Beta feedback
- Content: Pre-release testing, feedback

**#integrations**
- Purpose: IDE/tool integration discussion
- Content: MCP, Cursor, VS Code, etc.

**#ideas**
- Purpose: Share ideas
- Content: Wild ideas, brainstorming

## Roles Structure

### Administrative Roles

**@Admin**
- Color: Red (#FF0000)
- Permissions: All
- Members: Core team only

**@Moderator**
- Color: Orange (#FFA500)
- Permissions: Manage messages, kick, ban, timeout
- Members: Trusted community managers

**@Bot**
- Color: Gray (#808080)
- Permissions: Bot-specific
- Members: Server bots only

### Special Roles

**@Core Team**
- Color: Matrix Green (#00FF41)
- Permissions: Post in announcements
- Members: PHANTOM maintainers

**@Contributor**
- Color: Blue (#0000FF)
- Permissions: None special (recognition only)
- Members: Code contributors

**@Beta Tester**
- Color: Purple (#800080)
- Permissions: Access to beta channels
- Members: Active testers

**@Module Developer**
- Color: Cyan (#00FFFF)
- Permissions: Post in module channels
- Members: Module creators

### Level Roles (Automatic)

**@Newcomer** (Level 0-2)
- Just joined

**@Member** (Level 3-9)
- Active participant

**@Regular** (Level 10-19)
- Established member

**@Veteran** (Level 20+)
- Long-time community member

## Bot Configuration

### 1. Carl-bot (Moderation & Levels)

**Setup:**
1. Invite: https://carl.gg/
2. Permissions: Manage Roles, Manage Messages, Embed Links

**Configuration:**
```
!automod antispam on
!automod invites on
!levels on
!levels set announcement #announcements
```

**Auto-Moderation:**
- Max 5 messages per 5 seconds
- Block invite links in #general
- Filter profanity (optional)

### 2. Dyno (Logging & Custom Commands)

**Setup:**
1. Invite: https://dyno.gg/
2. Configure logging channel: #logs

**Custom Commands:**
```
?addrule
?addcommand phantom "Check out https://phantom.pm for installation and docs!"
?addcommand install "Install with: curl -fsSL https://phantom.pm/install | sh"
```

### 3. GitHub Bot (Repository Updates)

**Setup:**
1. Invite GitHub bot
2. Subscribe to PhantomPM/phantom
3. Configure notifications for:
   - New issues
   - New PRs
   - Releases
   - Stars milestones

**Channels:**
- #github-updates
- #releases (mirror)

### 4. Welcome Bot

**Setup:**
1. Use Carl-bot or Dyno
2. Configure welcome message:

```
Welcome to PHANTOM, {user}! 🎭

The invisible force behind every great product.

🚀 Get started: https://phantom.pm/install
📚 Read docs: https://phantom.pm/docs
💬 Introduce yourself in #introductions
❓ Need help? Check #help

Enjoy your stay!
```

## Welcome Message Template

**Pin in #welcome:**

```
Welcome to PHANTOM! 🎭

The invisible force behind every great product.

━━━ QUICK START ━━━
🚀 Install: curl -fsSL https://phantom.pm/install | sh
📚 Docs: https://phantom.pm/docs
⭐ GitHub: https://github.com/PhantomPM/phantom

━━━ CHANNELS ━━━
💬 #general - General discussion
🛠️ #help - Get help
🎯 #feature-requests - Suggest features
👥 #contributors - Contribute to PHANTOM
🎨 #showcase - Share your projects

━━━ RULES ━━━
1. Be respectful and inclusive
2. No spam or self-promotion
3. Stay on topic in specialized channels
4. Use threads for long discussions
5. Have fun! 🚀

Questions? Ask in #help or check our FAQ.
```

## Moderation Guidelines

### Moderation Team

**Responsibilities:**
- Enforce community guidelines
- Answer questions
- Welcome new members
- Manage spam/off-topic content
- Escalate serious issues to admins

**Best Practices:**
- Be friendly but firm
- Explain actions taken
- Use timeouts before bans
- Document serious incidents
- Stay neutral in disputes

### Enforcement Actions

**1. Warning**
- First offense: Verbal warning
- Second offense: Written warning
- Document in #mod-log

**2. Timeout (1 hour - 1 day)**
- Spam
- Mild toxicity
- Off-topic persistence

**3. Kick**
- Repeated rule violations
- Serious toxicity
- Can rejoin with invite

**4. Ban**
- Harassment
- Hate speech
- Bot/spam accounts
- Serious violations

### Auto-Moderation Rules

**Word Filter:**
- Slurs: Auto-delete + timeout
- Spam keywords: Auto-delete
- ALL CAPS messages > 50 chars: Warning

**Raid Protection:**
- Detect mass joins
- Enable verification gate
- Temporarily require phone verification

## Events & Activities

### Weekly Events

**Monday: Module Monday**
- Highlight community modules
- Share module ideas
- Q&A with module developers

**Wednesday: Workshop Wednesday**
- Live coding sessions
- Tutorial streams
- Deep dives into features

**Friday: Feature Friday**
- Preview upcoming features
- Gather feedback
- Beta testing announcements

### Monthly Events

**Community Call**
- Voice channel meetup
- Product updates
- Open Q&A
- Record and share

**Hackathon**
- 24-48 hour event
- Build modules/tools
- Prizes for winners
- Showcase results

### Special Events

**Launch Events**
- Major version releases
- New feature announcements
- Live demos

**AMA Sessions**
- Invite special guests
- Industry experts
- Core team AMA

## Growth Strategy

### Month 1: Foundation (Target: 100 members)
- [ ] Set up server structure
- [ ] Configure bots
- [ ] Invite core contributors
- [ ] Create initial content
- [ ] Soft launch on social media

### Month 2: Growth (Target: 500 members)
- [ ] Launch on Product Hunt
- [ ] Twitter campaign
- [ ] Partner with influencers
- [ ] Host first community call
- [ ] Share in relevant subreddits

### Month 3: Engagement (Target: 1000 members)
- [ ] Regular events established
- [ ] Active moderation team
- [ ] Community spotlight program
- [ ] Contributor recognition
- [ ] Module ecosystem growing

## Metrics to Track

**Discord Server Insights:**
- Total members
- Active members (daily/weekly)
- Message count
- Retention rate
- New joins per day

**Engagement:**
- Messages per channel
- Event attendance
- Help request resolution time
- Contributor activity

**Growth:**
- Invite conversion rate
- Social media referrals
- Organic vs invited members

## Promotion Strategy

### Onboarding New Users

1. **From CLI**: Add to `phantom doctor` or welcome message
   ```
   💬 Join our community: https://discord.gg/phantom
   ```

2. **From Website**: Prominent link in header/footer

3. **From GitHub**: Badge in README
   ```markdown
   [![Discord](https://img.shields.io/discord/SERVER_ID)](https://discord.gg/phantom)
   ```

4. **From Docs**: "Get Help" section

5. **Social Media**: Regular posts about community

### Content Calendar

**Daily:**
- Welcome new members
- Answer questions
- Share tips/tricks

**Weekly:**
- Community spotlight
- Module showcase
- Development updates

**Monthly:**
- Community stats
- Contributor recognition
- Event announcements

## Server Boosting

**Benefits to Unlock:**
- Level 1 (2 boosts): 128kbps audio, animated server icon
- Level 2 (7 boosts): 256kbps audio, server banner, 50MB uploads
- Level 3 (14 boosts): 384kbps audio, vanity URL, 100MB uploads

**Perks for Boosters:**
- Special @Server Booster role
- Exclusive channel access
- Early access to features
- Recognition in #announcements

## Integration with Other Platforms

### GitHub Integration

- Auto-post releases
- Issue/PR notifications
- Star milestones

### Twitter Integration

- Cross-post announcements
- Share community highlights

### Website Integration

- Embed Discord widget
- "Join Discord" CTAs
- Community stats display

## Emergency Procedures

### Server Raid

1. Enable verification gate
2. Lock down channels
3. Ban raiders in bulk
4. Contact Discord Trust & Safety
5. Post announcement when resolved

### Bot Compromise

1. Revoke bot permissions
2. Remove bot from server
3. Audit recent actions
4. Re-add with new credentials
5. Review security practices

### Moderator Issue

1. Remove moderation permissions
2. Investigate incident
3. Consult with core team
4. Take appropriate action
5. Communicate with community

## Resources

**Discord Support:**
- Discord Support: https://support.discord.com
- Discord Developers: https://discord.dev
- Discord Status: https://discordstatus.com

**Bot Documentation:**
- Carl-bot: https://carl.gg/documentation
- Dyno: https://dyno.gg/docs
- GitHub Bot: https://github.com/apps/github

**Community Management:**
- Discord Moderator Academy
- Community Guidelines Best Practices

---

**Server Invite Link:**
```
https://discord.gg/phantom
```

**Quick Setup Checklist:**
- [ ] Server created and named
- [ ] Icon and banner uploaded
- [ ] Channel structure configured
- [ ] Roles set up
- [ ] Bots invited and configured
- [ ] Welcome message pinned
- [ ] Rules channel created
- [ ] Moderation team assigned
- [ ] Vanity URL configured (if boosted)
- [ ] Integration with GitHub/Twitter
- [ ] Promotion strategy ready

**Launch Ready!** 🎭