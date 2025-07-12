# Collaborative AR Sessions

Multiple users can join the `/ar` preview page and edit layouts together. The portal connects to the orchestrator's WebRTC signaling endpoint and opens peer connections between participants.

Layout changes are transmitted over a data channel so each device updates in real time. The orchestrator forwards signaling messages and records session events via the analytics service for replay.

## Setup

1. Start the analytics service and orchestrator.
2. Open `/ar` in several browser windows. Each client will automatically join the default session.
3. Move objects in one window to see them appear in all others.
