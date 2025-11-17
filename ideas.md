# Scripture Scribbles Bible Reader Ideas


I've been doing some research and there are a few apps out there that combine both the bible and notes.  some better than others but even the best ones I found could use a lot of improvement. 

Here is what I am thinking. 

The main motivation for me comes from my dyslexia.  Being dyslexic means that the hardest part about studying the bible is the text itself.  Mental processing of text is hard for people like me and thats tough because the bible is 100% text.

My SSR is about making that easier.

Secondly. Many christians have bibles full of notes and highlights.  But I struggle with that and again I think its stems from being dyslexic and not being able to settle on a method for highlighting and the concern that I might change my mind tomorrow.  Where many people are happy to highlight anything of interest I need a reason.  This is where technoloygy can help, by having multiple note files I can change and adapt and not loose my original bible or impact any old perfectly good notes. 


SO here are my thoughts. 


1.  Features for dyslexia friendly bible reader

- font changes, we don't need to show 100's of fonts but have 4-5 fonts to choose from one of which should be the open dyslexic font.
  
- All full control over colour., not just dark vs light but allow changing of background and foreground colours.  Have a few built in themes both light and dark so users can get started quickly.  look at some catpushin? options
  

- Full font control, size, bold colour.


- In a later phase add bible reader to read the text out loud. My thoughts on this are to use a API for a high quality AI reader.  Happy for this to be behind a paid tier, possibly have cheaper readers on the free plan.  Depending on the tier we could limit to x minutes per day.

- If we go down the x minutes per day make this an average rather than hard fix.  I'd rather the user be able to get to a natural stopping point (end of book/chapter) than be forced to stop thier daily reading mind way through a verse.   30 mins per day should be plenty for most users so we could allow them to go to 45 minutes average.  

- Most users I suspect will start off with high usage then taper off once the novelty wears off so lets not punish users too early.

- for users that are persistently over the daily average prompt them to upgrade. 
  you are avaraging 45 minutes per day your current plan is for 30 minutes.  Do you want to upgrade?
  - Yes, for today only
  - yes, for this week
  - yes, permantant upgrade
  - no thank you
    

- I also want pricing tiers to be fair and automatically downgrade, or stop if not actively used.
  E.g if user is paying for 45 minutes per day but only using 10, downgrade to a lower tier, notify them but automate the downgrade unless they say no.  We could look at the last 3 months average use.  Similarly if not logged in for 3 months stop the subscription entirely.  The entire purpse is that as Christian organisation we should be treating people fairly and not nickle diming them on convenience.  The app is free, they only pay when they need something that costs me money, the aim is to cover costs, maybe make a little profit and share a % with charity.


Bible View

See file bible_view.png

- In this view verse 1 and 6 have been selected (the box around them is probably not necessary but it will required some visual que either a change in font colour and background colour)
- verse 2 has a note attached to it and is fully highlighted
- verse 3 has two tags and a word highlight
- verse 4 a single tag
- verse 5 a tag and a note
- verse 6 has 2 tag ands a note and because its selected they are displayed under the verse. To reduce vertical height the tags are listed horizontally


This screenshot is shared to show you a layout I like rather than the design system so don't look at this and think I need yellow tags because the colours are not relevant its the layout I like here. 

What I like is that when tags and notes are added they are added to the margin.  
Tags can be any colour

When you select a verse the notes and tags appear under neath the verse but otherwise they sit in the margin as an icon.  From this selected view the user should also see subtle edit and delete icons. 


Currently we have a lot of options for what can and can't be turned off for annotations.  I think we simplfy this to reduce choice and have just 3 options:

- On - fully visible in the margings in full colour
- subtle - tags and notes fully visible but muted colours, or just greyscale, highlights become underlines. 
- off - don't show any annotaitons at all.



Highlighting

Lets allow both word and verse highlighting.  If in doubt which ever is created last prevails.

E.g:
- if you highlight a word then highlight a verse the word keeps its highlight if its a different colour, if its the same colour its folded into the verse highlight.
- if you highlight a vese then highlight a word the is highlighted, assuming its a different colour
- if you clear a verse highlight then word highligts of different colours remain unchanged.
- if you clear a word highlight then verse highlights of different colorus remain unchanged, in this case the word adopts the verse highlight. 
- if you select clear verse highlight but it only has word highlighting then the words are cleared. 
- if you select clear a verse highlight and it contains both word and verse highlighting then only the verse highlighting is cleared. The user can then select it again to clear the words.
  


Sermon Notes

I think this should be next to the bible reader.  On desktop we should have enough screen to show side by side, on desktop we should be able to swipe left/right to swich between reader and notes. 


The sermon notes screen should be a large clean text edit area with minimal menu interferance.  We will need a text edit bar with markdown text editing options for user ease.  E.g. insert '#' or '[[]]' with a single click.

If you add '[[]]' the users crsor shou end in the middle of the square brackets. 

we should also have sermon note templates (with optional YAML) for things like speaker, date, location

Scrolling vs swiping

So users don't confuse swipe right for notes vs next chapter we should allow scrolling to next chapter. so on reaching the bottom of the screen if there is an intetionlay scroll to go down furtehr you get to the next chapter. 

This needs a quick add verse where you select a verse (or verses) and quickly copy either the reference or the actual verses to the note. 

When adding a verse by quick note or copying from the reader we should display verse no. verse text (bible Ref in 3 characters)

E.g. 

Rom 1:6 (AFV)
"In Whom you also are called of Jesus Christ:"


Or 

"In Whom you also are called of Jesus Christ:"
Rom 1:6 (AFV)


We should pick a few styles and allow the user to select in settings. 

Tags

We talked about tags earlier being a margin icon.  
When users select to add a tag they should be able to select the colour as well.  There should be a select of pre-defined colours based on the theme.  users can change these by updating the theme. 

When adding tags uses should also see all previously created tags so they can quickly select the tag they want. 


Home Screen.

I want a clear easy to use home screen with the following options

- Theme
- settings
- tags (to create and manage tags)
- Bible reader (go to bible reader)
- Sermon Notes, split
	- new sermon note
	- open existing sermon note
	- load template
	

Bible navigation see screenshots. 

These are screenshots from another app. I don't particularly like the design but the layout works really well on mobile.  Select the book, then chapter and if necessary for the context the verse. 



Design

I've attached a design.json file that describes in detail the design system I have chosen.   You should apply this to all current and future designs. 

I would like to have 3 light and 3 dark based themes for users to choose from. 