---
type: DocumentSection
title: API Ga t ew a y security
document_id: 8fd06f60-9c3e-4df6-9e30-19c57c342d83
page_start: 12
page_end: 13
source_type: pdf
tags:
  - api-ga-t-ew-a-y-security
---

3 7 .     W h a t   i s   d i s t r i b u t e d   t r a c i n g ? T r acking a r equest acr oss multiple micr oservices . T ools: Zipkin Sleuth 3 8 .   W h a t   a r e   c h a l l e n g e s   i n   m i c r o s e r v i c e s ? Netw ork la t ency Da ta consist ency Deplo ymen t comple xity Monit oring difficulty 3 9 .   W h a t   i s   t h e   d i ff e r e n c e   b e t w e e n   M o n o l i t h   a n d   M i c r o s e r v i c e s ? Monolith Micr oser vices Single app Multiple services Har d t o scale Easily scalable T igh t coupling Loose coupling One deplo ymen t Independen t deplo ymen t 4 0 .   W h a t   i s   d a t a b a s e   p e r   s e r v i c e ? Each micr oservice has its  o wn da tabase  t o ensur e independence . 4 1 .   H o w   d o   y o u   h a n d l e   s e c u r i t y   i n   m i c r o s e r v i c e s ? O Auth2 / JWT authen tica tion Spring Security in t e gr a tion 4 2 .   H o w   w o u l d   y o u   d e s i g n   a n   e - c o m m e r c e   s y s t e m   u s i n g   m i c r o s e r v i c e s ? Split in t o services: User Service P r oduct Service Or der Service 
P a ymen t Service Each communica t es via RES T or messaging. 4 3 .   W h a t   h a p p e n s   i f   o n e   m i c r o s e r v i c e   g o e s   d o w n ? Ans w er: Cir cuit br eak er st ops calls F allback r esponse is r eturned S yst em con tinues partially functioning 
