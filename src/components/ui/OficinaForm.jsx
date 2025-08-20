import React from 'react';
import Input from '../common/Input';
import Combobox from '../common/Combobox';
import InputNumero from '../common/InputNumero';
import Select from '../common/Select';
import styles from '../../pages/Cliente Empresa/agregar-cliente-empresa.module.css';

const OficinaForm = ({
    formValues,
    errors,
    handleFieldChange,
    loadingCountries,
    errorCountries,
    countryOptions,
    citiesOficina,
    loadingCitiesOficina,
    errorCitiesOficina,
    officeTypes = [],
    isTipoOficinaEditable = false
}) => {
    return (
        <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Oficina</h1>
            <div className={styles.form}>
                <div className={styles.formItem}>
                    <p className={styles.formSubtitle}>Datos</p>
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Nombre"
                        type="text"
                        id="nombreOficina"
                        required
                        errorMessage={errors.nombreOficina}
                        value={formValues.nombreOficina || ''}
                        onChange={(e) => handleFieldChange('nombreOficina', e.target.value)}
                    />
                    {isTipoOficinaEditable ? (
                        <Select
                            label="Tipo de Oficina"
                            id="tipoOficina"
                            required
                            errorMessage={errors.tipoOficina}
                            value={formValues.tipoOficina || ''}
                            onChange={(e) => handleFieldChange('tipoOficina', e.target.value)}
                            options={officeTypes.map(type => ({
                                value: type.id,
                                label: type.name
                            }))}
                            placeholder="Selecciona"
                        />
                    ) : (
                        <Input
                            label="Tipo de Oficina"
                            type="text"
                            id="tipoOficina"
                            required
                            errorMessage={errors.tipoOficina}
                            readOnly
                            value={formValues.tipoOficina || 'Principal'}
                            onChange={(e) => handleFieldChange('tipoOficina', e.target.value)}
                        />
                    )}
                </div>

                <div className={styles.formItem}>

                    <Combobox
                        label="Pais"
                        id="paisOficina"
                        options={loadingCountries ? [{ label: "", value: "" }] : countryOptions}
                        required
                        errorMessage={errors.paisOficina}
                        value={formValues.paisOficina || ''}
                        onChange={(e) => handleFieldChange('paisOficina', e.target.value)}
                    />
                    <Combobox
                        label="Ciudad"
                        type="text"
                        id="ciudadOficina"
                        options={loadingCitiesOficina ? [{ label: "Selecciona", value: "" }] : citiesOficina.map(city => ({ label: city.name, value: city.id }))}
                        required
                        errorMessage={errors.ciudadOficina}
                        value={formValues.ciudadOficina || ''}
                        onChange={(e) => handleFieldChange('ciudadOficina', e.target.value)}
                        disabled={loadingCitiesOficina}
                    />
                    {errorCitiesOficina && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            Error al cargar ciudades: {errorCitiesOficina}
                        </div>
                    )}
                </div>
                <div className={styles.formItem}>

                    <Input
                        label="Dirección"
                        type="text"
                        id="direccionOficina"
                        required
                        errorMessage={errors.direccionOficina}
                        value={formValues.direccionOficina || ''}
                        onChange={(e) => handleFieldChange('direccionOficina', e.target.value)}
                    />
                    <Input
                        label="Código Postal"
                        type="number"
                        id="codigoPostalOficina"
                        required
                        errorMessage={errors.codigoPostalOficina}
                        value={formValues.codigoPostalOficina || '0000'}
                        onChange={(e) => handleFieldChange('codigoPostalOficina', e.target.value)}
                    />
                </div>
                <div className={styles.formItem}>
                    <InputNumero
                        label="Celular"
                        id="celularOficina"
                        required
                        errorMessage={errors.celularOficina}
                        value={formValues.celularOficina || ''}
                        onChange={(e) => handleFieldChange('celularOficina', e.target.value)}
                    />
                    <InputNumero
                        label="Teléfono Fijo"
                        id="telefonoOficina"
                        errorMessage={errors.telefonoOficina}
                        value={formValues.telefonoOficina || ''}
                        onChange={(e) => handleFieldChange('telefonoOficina', e.target.value)}
                    />
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        id="correoElectronicoOficina"
                        required
                        info={"Se enviara información de MyFull Assist a este correo."}
                        errorMessage={errors.correoElectronicoOficina === true ? "Este campo es requerido" : errors.correoElectronicoOficina}
                        value={formValues.correoElectronicoOficina || ''}
                        onChange={(e) => handleFieldChange('correoElectronicoOficina', e.target.value)}
                    />
                    <Input
                        label="Fecha de Aniversario"
                        type="date"
                        id="fechaAniversarioOficina"
                        errorMessage={errors.fechaAniversarioOficina}
                        value={formValues.fechaAniversarioOficina || ''}
                        onChange={(e) => handleFieldChange('fechaAniversarioOficina', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default OficinaForm; 