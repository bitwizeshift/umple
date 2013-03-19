/* EXPERIMENTAL CODE - NON COMPILEABLE VERSION OF C++ */
/*PLEASE DO NOT EDIT THIS CODE*/
/*This code was generated using the UMPLE 1.16.0.2388 modeling language!*/

#include "student.h"

	
  //------------------------
  // CONSTRUCTOR
  //------------------------
  
 student::student(const int & aAge, const int & aWeight)
  {
    if ( !(18>aAge||3<aWeight))
    {
      throw "Please provide a valid age";
    }
    if ( !(18>aAge||3<aWeight))
    {
      throw "Please provide a valid weight";
    }
    age = aAge;
    weight = aWeight;
  }
  
  //------------------------
  // COPY CONSTRUCTOR
  //------------------------

 student::student(const student & student)
  {
    this->age = student.age;
    this->weight = student.weight;
  }
  	
  //------------------------
  // Operator =
  //------------------------

 student student::operator=(const student & student)
  {
    this->age = student.age;
    this->weight = student.weight;
  }

  //------------------------
  // INTERFACE
  //------------------------

  bool student::setAge(const int & aAge)
  {
    bool wasSet = false;
    if (18>aAge||3<weight)
    {
    age = aAge;
    wasSet = true;
    }
    return wasSet;
  }

  bool student::setWeight(const int & aWeight)
  {
    bool wasSet = false;
    if (18>age||3<aWeight)
    {
    weight = aWeight;
    wasSet = true;
    }
    return wasSet;
  }

  int student::getAge() const
  {
    return age;
  }

  int student::getWeight() const
  {
    return weight;
  }

  
  //------------------------
  // DESTRUCTOR
  //------------------------
  
student::~student()
  {}

