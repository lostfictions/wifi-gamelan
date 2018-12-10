## _the wifi gamelan_

inspired by paul demarinis's ["the pygmy gamelan"](http://pauldemarinis.org/PygmyGamelan.html).

a generative patch for max 8 that creates melodies from nearby wifi
networks. each network has its own unique procedural tune, and they layer to create a
soundscape that varies based on the strength and proximity of signals. wander
around and discover which signals create the best tunes (or see if you can find
an oasis of silence)!

### _overview_

the patch consists of two major components. the sounds themselves are produced
by a set of additive synthesis subpatches within max. these are a more or less
straightforward reimplementation of the “bell” practical project from andy
farnell’s book _designing sound_, ported from pure data to max (with some tweaks,
eg. to enable polyphony via max’s `poly~` object).

a discrete set of notes are used; the fundamental frequencies were derived from
spectral analysis of a sample of a [gangsa](https://en.wikipedia.org/wiki/Gangsa)
played in the [pelog scale](https://en.wikipedia.org/wiki/Pelog). i
replicated a five-note mode of the scale, and duplicated and transposed it down
an octave to yield a total of ten possible notes.

the other major component of the patch is a node script, used with max 8’s
new [node for max](https://cycling74.com/products/max-features#node-for-max)
functionality, which handles the scanning of wifi networks as
well as the all the internal state of the patch (fading in and out
newly-discovered or out-of-range networks respectively, sequencing and queueing
notes, deriving musical phrases from network identities, etc.)

### _phrase generation_

musical phrases are derived from an immutable identity unique to every piece of
wifi hardware, known as a [mac
address](https://en.wikipedia.org/wiki/Mac_address). these addresses are in a
form like `00:17:ab:be:28:1c`, where each segment is an 8-bit number written in
hexadecimal notation; there are always six segments, yielding a 48-bit identity.

the musical phrases consist of six beats. on each beat, zero, one or two notes
might play. as noted above, i chose ten discrete possible notes; for each note
chance of each beat one of those might be selected, and if not there will be
silence (a 6 out of 16 chance). sixteen choices fits in four bits — times two
for two chances that a note might play — makes eight bits. and eight bits by six
beats makes 48, adding up exactly to the amount of info available in our mac
address.

note volume for the whole phrase is based on the current strength of the network
signal. move away from the network and you should hear the phrase fade.

---

this probably makes more sense as a toy that could be run from a phone (and by
anybody, not just max users!) -- i may revisit this later, but the project is
preserved here for posterity.

also: at the time of writing, node for max is nigh-undocumented, save for a few tutorial
videos, and quite buggy. i'm glad i tried it out, but if you're inspired by this and
thinking of giving it a shake, bear it mind that it doesn't feel totally baked just
yet.

