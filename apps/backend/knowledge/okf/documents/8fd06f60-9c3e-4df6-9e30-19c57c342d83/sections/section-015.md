---
type: DocumentSection
title: RES T APIs (HT TP)
document_id: 8fd06f60-9c3e-4df6-9e30-19c57c342d83
page_start: 10
page_end: 11
source_type: pdf
tags:
  - res-t-apis-ht-tp-
---

27 . Explain serv er - side r endering and clien t - side r endering? Ser v er - Side R endering (SSR): R endering wher e the  ser v er g ener a t es the complet e HTML pag e  and sends it t o the clien t (br o w ser). Clien t - Side R endering (CSR): R endering wher e the  br o w ser g ener a t es the UI using Ja v aScript , typically a f t er f et ching da ta fr om the serv er . 2 8 .     W h a t   a r e   m i c r o s e r v i c e s ? Micr oservices is an ar chit ectur al style wher e an applica tion is divided in t o  small , independen t ser vices . Each service: Runs independen tly Has its o wn da tabase (optional) Communica t es via APIs (usually RES T) 2 9 .     W h y   u s e   S p r i n g   B o o t   f o r   m i c r o s e r v i c e s ? Spring Boot simplifies micr oservices dev elopmen t b y: P r o viding  aut o - con figur a tion Embedded serv ers (T omca t , Jetty) Eas y RES T API cr ea tion In t e gr a tion with Spring Cloud t ools 3 0 .     H o w   d o   m i c r o s e r v i c e s   c o m m u n i c a t e   w i t h   e a c h   o t h e r ? They communica t e using: Messaging queues (RabbitMQ , Ka fka) gRPC (less common in Spring Boot) 3 1 .     W h a t   i s   s e r v i c e   d i s c o v e r y ? Service disco v ery helps services  find each other dynamically  without har dcoding URLs . Common t ool: Eur eka Ser v er 
3 2 .     W h a t   i s   a n   A P I   G a t e w a y ? An API Ga t ew a y is a  single en tr y poin t  f or all clien t r equests . R esponsibilities: R outing r equests Authen tica tion Ra t e limiting Ex ample: Spring Cloud Ga t ew a y 3 3 .     W h a t   i s   l o a d   b a l a n c i n g   i n   m i c r o s e r v i c e s ? Load balancing distribut es r equests acr oss multiple instances of a service . T ool: Spring Cloud LoadBalancer 3 4 .     W h a t   i s   f a u l t   t o l e r a n c e ? F ault t oler ance ensur es the s yst em con tinues w orking ev en if some services f ail . T ools: R esilience4j (Cir cuit Br eak er pa tt ern) 3 5 .   W h a t   i s   C i r c u i t   B r e a k e r   p a t t e r n ? It pr ev en ts r epea t ed calls t o a f ailing service . Sta t es: Closed → normal Open → block calls Half - open → t est r eco v ery 3 6 .     W h a t   i s   c e n t r a l i z e d   c o n fi g u r a t i o n ? Managing con figur a tion f or all micr oservices in one place . T ool: Spring Cloud Con fig Serv er 
