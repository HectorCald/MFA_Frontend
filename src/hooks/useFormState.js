import { useState } from 'react';

export const useFormState = (initialState = {}) => {
    // Estados principales del formulario
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [completedSteps, setCompletedSteps] = useState([]);
    const [showModalExito, setShowModalExito] = useState(false);
    
    // Estados para los valores de los campos del formulario
    const [formValues, setFormValues] = useState(initialState);
    
    // Estado para almacenar los datos del formulario completado
    const [formDataCompleto, setFormDataCompleto] = useState({});

    // Función para manejar cambios en los campos del formulario
    const handleFieldChange = (fieldId, value) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    // Función para manejar múltiples cambios a la vez
    const handleMultipleFieldChanges = (changes) => {
        setFormValues(prev => ({
            ...prev,
            ...changes
        }));
    };

    // Función para limpiar campos específicos
    const clearFields = (fieldIds) => {
        setFormValues(prev => {
            const newValues = { ...prev };
            fieldIds.forEach(fieldId => {
                delete newValues[fieldId];
            });
            return newValues;
        });
    };

    // Función para resetear el formulario
    const resetForm = () => {
        setFormValues(initialState);
        setErrors({});
        setCompletedSteps([]);
        setCurrentStep(0);
        setShowModalExito(false);
        setFormDataCompleto({});
    };

    // Función para manejar errores
    const setFieldError = (fieldId, error) => {
        setErrors(prev => ({
            ...prev,
            [fieldId]: error
        }));
    };

    // Función para limpiar errores
    const clearErrors = () => {
        setErrors({});
    };

    // Función para limpiar error específico
    const clearFieldError = (fieldId) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
        });
    };

    // Función para manejar pasos
    const goToStep = (stepId) => {
        if (completedSteps.includes(stepId)) {
            setCurrentStep(stepId);
            clearErrors();
        }
    };

    const nextStep = () => {
        if (currentStep < 4) { // Asumiendo 5 pasos (0-4)
            setCurrentStep(currentStep + 1);
            clearErrors();
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            clearErrors();
        }
    };

    // Función para marcar paso como completado
    const markStepAsCompleted = (stepId) => {
        setCompletedSteps(prev => {
            if (!prev.includes(stepId)) {
                return [...prev, stepId];
            }
            return prev;
        });
    };

    // Función para verificar si un paso está completado
    const isStepCompleted = (stepId) => {
        return completedSteps.includes(stepId);
    };

    // Función para manejar el modal
    const openModal = () => {
        setShowModalExito(true);
    };

    const closeModal = () => {
        setShowModalExito(false);
    };

    // Función para guardar datos completos del formulario
    const saveFormData = (data) => {
        setFormDataCompleto(data);
    };

    return {
        // Estados
        currentStep,
        errors,
        completedSteps,
        showModalExito,
        formValues,
        formDataCompleto,

        // Setters directos
        setCurrentStep,
        setErrors,
        setCompletedSteps,
        setShowModalExito,
        setFormValues,
        setFormDataCompleto,

        // Funciones de manejo de campos
        handleFieldChange,
        handleMultipleFieldChanges,
        clearFields,
        resetForm,

        // Funciones de manejo de errores
        setFieldError,
        clearErrors,
        clearFieldError,

        // Funciones de manejo de pasos
        goToStep,
        nextStep,
        previousStep,
        markStepAsCompleted,
        isStepCompleted,

        // Funciones de manejo del modal
        openModal,
        closeModal,

        // Funciones de datos
        saveFormData
    };
}; 