---
type: DocumentSection
title: 3. Repository Layer (DAO Layer)
document_id: e6821c1d-b18d-4672-930a-545590ea58b2
page_start: 16
page_end: 16
source_type: pdf
tags:
  - 3-repository-layer-dao-layer-
---

Main Layers in Spring Boot Controller Layer ↓ Service Layer ↓ Repository (DAO) Layer ↓ Database Responsibility Handles: •   client requests, •   HTTP methods, •   sending responses. It acts as an entry point of the application. Annotation Used @RestController   or @ Controller Responsibility Contains: •   business logic, •   validations, •   processing logic. Controller communicates with Service layer. Annotation Used @Service Responsibility Handles database operations. 
