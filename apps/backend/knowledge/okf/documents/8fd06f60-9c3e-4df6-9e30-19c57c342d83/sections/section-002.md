---
type: DocumentSection
title: 2. Name some  Methods of HttpServlet?
document_id: 8fd06f60-9c3e-4df6-9e30-19c57c342d83
page_start: 1
page_end: 1
source_type: pdf
tags:
  - 2-name-some-methods-of-httpservlet-
---

Adv ance ja v a questions and ans w ers 1 . Wha t is Servlet? In ho w man y w a ys can w e cr ea t e servlet classes ? A  Ser vlet  is a Ja v a class used t o handle clien t r equests and g ener a t e dynamic r esponses in w eb applica tions . W a y s   t o   c r e a t e   S e r v l e t : 1 .  By implemen ting Servlet in t erf ace 3 .  Ext ending HttpServlet  (most commonly used) doGet() → Handles GET r equests doP ost() → Handles POS T r equests doP ut() → Handles PUT r equests doDelet e() → Handles DELETE r equests doHead() → R eturns headers only service() → Dispa t ches r equest t o appr opria t e method 3 . Explain Servlet Lif e C y cle and its methods ? Loading  → As per the r equest particular servlet class will be loaded t o con tainer Instan tia tion  → The w eb con tainer will cr ea t e an instance f or tha t loaded class Initializa tion   → Called once when servlet is cr ea t ed.  init() R equest handling  → Handles ev ery r equest .  ser vice() Destruction  → Called once bef or e servlet is destr o y ed.  destr o y() 
