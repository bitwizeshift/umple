/**
 * <copyright>
 * </copyright>
 *

 */
package cruise.umple.umple;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>State Machine Definition</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * <ul>
 *   <li>{@link cruise.umple.umple.StateMachineDefinition#getStates <em>States</em>}</li>
 * </ul>
 * </p>
 *
 * @see cruise.umple.umple.UmplePackage#getStateMachineDefinition()
 * @model
 * @generated
 */
public interface StateMachineDefinition extends Entity
{
  /**
   * Returns the value of the '<em><b>States</b></em>' containment reference list.
   * The list contents are of type {@link cruise.umple.umple.State}.
   * <!-- begin-user-doc -->
   * <p>
   * If the meaning of the '<em>States</em>' containment reference list isn't clear,
   * there really should be more of a description here...
   * </p>
   * <!-- end-user-doc -->
   * @return the value of the '<em>States</em>' containment reference list.
   * @see cruise.umple.umple.UmplePackage#getStateMachineDefinition_States()
   * @model containment="true"
   * @generated
   */
  EList<State> getStates();

} // StateMachineDefinition
