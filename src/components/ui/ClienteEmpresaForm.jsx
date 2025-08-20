import React, { useEffect } from 'react';
import Input from '../common/Input';
import Combobox from '../common/Combobox';
import Select from '../common/Select';
import CheckBox from '../common/CheckBox';
import styles from '../../pages/Cliente Empresa/agregar-cliente-empresa.module.css';

const ClienteEmpresaForm = ({
    formValues,
    errors,
    handleFieldChange,
    handlePagoChange,
    pagoSeleccionado,
    loadingCountries,
    loadingTypes,
    errorCountries,
    errorTypes,
    countryOptions,
    businessClientTypeOptions
}) => {
    console.log('=== CLIENTE EMPRESA FORM ===');
    console.log('pagoSeleccionado recibido:', pagoSeleccionado);
    console.log('typeof pagoSeleccionado:', typeof pagoSeleccionado);
    
    // useEffect para monitorear cambios en pagoSeleccionado
    useEffect(() => {
        console.log('=== USEEFFECT CLIENTE EMPRESA FORM ===');
        console.log('pagoSeleccionado cambió a:', pagoSeleccionado);
    }, [pagoSeleccionado]);
    
    const Info = {
        details: "Pago centralizado: La información contable se registrará una sola vez, ya que los pagos son gestionados de forma centralizada por la oficina principal.",
    };

    const InfoNoCentralizado = {
        details: "Pago descentralizado: Los pagos se gestionarán de forma independiente por cada oficina, manteniendo control individual de la información contable.",
    };

    // No renderizar hasta que pagoSeleccionado tenga un valor válido
    if (!pagoSeleccionado) {
        console.log('=== NO RENDERIZANDO - pagoSeleccionado vacío ===');
        return <div>Cargando...</div>;
    }
    
    return (
        <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Cliente Empresa</h1>
            <div className={styles.form}>
                <div className={styles.formItem}>
                    <p className={styles.formSubtitle}>Datos</p>
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Nombre"
                        type="text"
                        id="nombreEmpresa"
                        required
                        errorMessage={errors.nombreEmpresa}
                        value={formValues.nombreEmpresa || ''}
                        onChange={(e) => handleFieldChange('nombreEmpresa', e.target.value)}
                    />
                    <Input
                        label="Carnet de Identidad/NIT"
                        type="number"
                        id="ciNitEmpresa"
                        required
                        errorMessage={errors.ciNitEmpresa}
                        value={formValues.ciNitEmpresa || ''}
                        onChange={(e) => handleFieldChange('ciNitEmpresa', e.target.value)}
                    />
                </div>
                <div className={styles.formItem}>
                    <Combobox
                        label="Pais"
                        id="paisEmpresa"
                        options={loadingCountries ? [{ label: "", value: "" }] : countryOptions}
                        required
                        errorMessage={errors.paisEmpresa}
                        value={formValues.paisEmpresa || ''}
                        onChange={(e) => handleFieldChange('paisEmpresa', e.target.value)}
                        disabled={loadingCountries}
                    />
                    {errorCountries && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            Error al cargar países: {errorCountries}
                        </div>
                    )}
                    <Input
                        label="Número IATA"
                        type="number"
                        id="numeroIataEmpresa"
                        value={formValues.numeroIataEmpresa || ''}
                        onChange={(e) => handleFieldChange('numeroIataEmpresa', e.target.value)}
                    />
                </div>
                <div className={styles.formItem}>
                    <Select
                        label="Tipo de Cliente"
                        id="tipoClienteEmpresa"
                        options={loadingTypes ? [{ label: "Cargando...", value: "" }] : businessClientTypeOptions}
                        required
                        errorMessage={errors.tipoClienteEmpresa}
                        value={formValues.tipoClienteEmpresa || ''}
                        onChange={(e) => handleFieldChange('tipoClienteEmpresa', e.target.value)}
                        disabled={loadingTypes}
                    />
                    {errorTypes && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            Error al cargar tipos: {errorTypes}
                        </div>
                    )}
                    {console.log('=== ANTES DE RENDERIZAR CHECKBOX ===')}
                    {console.log('pagoSeleccionado para CheckBox:', pagoSeleccionado)}
                    {console.log('Opciones del CheckBox:', [
                        { label: "Centralizado", value: "centralizado" },
                        { label: "Descentralizado", value: "descentralizado" },
                    ])}
                    <CheckBox
                        groupLabel="Pago"
                        groupId="servicios"
                        options={[
                            { label: "Centralizado", value: "centralizado" },
                            { label: "Descentralizado", value: "descentralizado" },
                        ]}
                        multiple={false}
                        required
                        value={pagoSeleccionado}
                        onChange={handlePagoChange}
                        info={pagoSeleccionado === "centralizado" ? Info.details : InfoNoCentralizado.details}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClienteEmpresaForm; 