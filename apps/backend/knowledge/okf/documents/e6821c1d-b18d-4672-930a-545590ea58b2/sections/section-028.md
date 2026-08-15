---
type: DocumentSection
title: REST APIs (Representational State Transfer APIs) are web services that allow
document_id: e6821c1d-b18d-4672-930a-545590ea58b2
page_start: 12
page_end: 12
source_type: pdf
tags:
  - rest-apis-representational-state-transfer-apis-are-web-services-that-allow
---

38)   What is web se rvices Web services   are a way for different software applications to communicate with each other over the internet. A web service acts like a bridge between applications, allowing them to share data and functionality, even if they are built using different languages or run on different systems. 3 9)   Types Of Web Services •   Uses XML •   More strict and secure •   Common in enterprise systems •   Uses HTTP methods (GET, POST, PUT, DELETE) •   Lightweight and widely used •   Often returns JSON 4 0 )   What are REST APIs & Name some Rules of REST? communication between client and server using standard HTTP methods. They follow a stateless architecture where data is exchanged in formats like JSON or XML, and each resource is   identified by a unique URL. •   Stateless  -   Each request from the client must contain all the information needed. The server does not store client state between requests. •   Client – Server Architecture  -   The client and server are separate, allowing independent development and scalability. We should send the data in JSON format, because it is lightweight, simple, and JSON data can be directly converted into objects without compl ex parsing. •   HTTP Methods  -   For Proper HTTP request We should use proper HTTP methods •   The URL path should be independent We should follow proper HTTP protocol's The URL path shouldn't be verb and singular, it should be plural and noun. 
