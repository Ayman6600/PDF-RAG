---
type: DocumentSection
title: 20  Why is XmlBeanFactory deprecated?
document_id: e6821c1d-b18d-4672-930a-545590ea58b2
page_start: 5
page_end: 5
source_type: pdf
tags:
  - 20-why-is-xmlbeanfactory-deprecated-
---

Implemantation classes for  BeanFactory and ApplicationContext 1 7 . What is Spring Container? Spring container is the core part of Spring that creates, manages, and connects objects (beans) in a Spring application. It is responsible for: Creating objects (beans) Managing lifecycle Injecting dependencies 18 . What is BeanFactory? BeanFactory is the  basic container of Spring IoC   that: •   Creates objects •   Manages dependencies •   Provides lazy loading 19)  What is XmlBeanFactory? XmlBeanFactory is an  old implementation of BeanFactory that reads XML configuration file. Because: •   It is outdated •   Lacks modern features •   Replaced by ApplicationContext •   Spring encourages annotation - based configuration 
