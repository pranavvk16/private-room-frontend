# UI refresh and message duplication fix

1. Trace current message flow  
   - Review ChatRoom send/receive logic, socket listeners, and MessageList keys to pinpoint why messages render twice (e.g., optimistic append plus echoed socket event or key collision).  
   - Decide on a single source of truth for displayed messages and document the fix approach.

2. Redesign for minimal, intentional look  
   - Define a simplified visual direction (clean typography, neutral palette, subtle gradient/pattern background) that removes tech-stack brag copy.  
   - Adjust header/nav hierarchy to focus on the chat experience and mobile friendliness.

3. Update core UI components  
   - Restyle message list, bubbles, input bar, and typing indicator to match the minimal theme and improve readability.  
   - Tighten spacing, shadows, and transitions; ensure dark/light parity.

4. Implement message de-duplication  
   - Apply the chosen fix (e.g., avoid double append on send vs socket echo, ensure stable unique keys) and verify messages render once.  
   - Keep local optimistic send if desired, but gate against duplicates.

5. Validate flows  
   - Manually smoke-test create/join/chat, typing indicators, mute/leave, and expired-room behavior in both themes.  
   - Note any follow-up items or polish opportunities.
