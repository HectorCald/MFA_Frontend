import React, { useState } from 'react';
import Input from '../common/Input';
import Combobox from '../common/Combobox';
import Select from '../common/Select';
import InputNumero from '../common/InputNumero';
import CheckBox from '../common/CheckBox';
import styles from '../../pages/Cliente Empresa/agregar-cliente-empresa.module.css';
import BotonBuscar from './BotonBuscar';
import BuscarPersona from './BuscarPersona';

const ContactoContableForm = ({
    formValues,
    errors,
    handleFieldChange,
    handleContableGerenteChange,
    isContableGerente,
    loadingCountries,
    errorCountries,
    countryOptions,
    citiesContable,
    loadingCitiesContable,
    errorCitiesContable
}) => {
    const [showBuscarPersona, setShowBuscarPersona] = useState(false);

    const handlePersonSelect = (person) => {
        // Llenar automáticamente TODOS los campos del formulario con los datos de la persona seleccionada
        
        // Datos básicos
        handleFieldChange('nombreContable', person.first_name || '');
        handleFieldChange('apellidoContable', person.last_name || '');
        
        // Formatear la fecha de nacimiento para el input type="date" (YYYY-MM-DD)
        let fechaFormateada = '';
        if (person.birthdate) {
            try {
                const fecha = new Date(person.birthdate);
                if (!isNaN(fecha.getTime())) {
                    fechaFormateada = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
                }
            } catch (error) {
                console.error('Error formateando fecha:', error);
            }
        }
        handleFieldChange('fechaNacimientoContable', fechaFormateada);
        
        handleFieldChange('generoContable', person.gender === 'M' ? 'masculino' : 'femenino');
        handleFieldChange('dniCiContable', person.dni || '');
        
        // Ubicación y dirección
        handleFieldChange('paisEmisionContable', person.dni_country_id || '');
        handleFieldChange('paisResidenciaContable', person.country_id || '');
        handleFieldChange('ciudadContable', person.city_id || '');
        handleFieldChange('direccionContable', person.address || '');
        handleFieldChange('codigoPostalContable', person.postal_code || '');
        
        // Contacto
        handleFieldChange('telefonoContable', person.cellphone || '');
        handleFieldChange('correoElectronicoContable', person.email || '');
        
        console.log('Persona seleccionada para contable:', person);
        console.log('Fecha de nacimiento original:', person.birthdate);
        console.log('Fecha de nacimiento formateada:', fechaFormateada);
        console.log('Campos llenados automáticamente');
        
        setShowBuscarPersona(false);
    };

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Contacto de Contable</h1>
            <div className={styles.form}>
                <div className={styles.formItem} style={{justifyContent: 'space-between'}}>
                    <p className={styles.formSubtitle}>Datos</p>
                    <BotonBuscar onClick={() => setShowBuscarPersona(true)} />
                </div>
                
                {showBuscarPersona && (
                    <BuscarPersona 
                        onClose={() => setShowBuscarPersona(false)}
                        onPersonSelect={handlePersonSelect}
                    />
                )}
                
                <div className={styles.formItem}>
                    <CheckBox
                        label="Usar al gerente general como contacto contable"
                        id="gerenteGeneralContable"
                        checked={isContableGerente}
                        onChange={handleContableGerenteChange}
                    />
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Nombre"
                        type="text"
                        id="nombreContable"
                        required
                        errorMessage={errors.nombreContable}
                        value={formValues.nombreContable || ''}
                        onChange={(e) => handleFieldChange('nombreContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                    <Input
                        label="Apellido"
                        type="text"
                        id="apellidoContable"
                        required
                        errorMessage={errors.apellidoContable}
                        value={formValues.apellidoContable || ''}
                        onChange={(e) => handleFieldChange('apellidoContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Fecha de Nacimiento"
                        type="date"
                        id="fechaNacimientoContable"
                        required
                        errorMessage={errors.fechaNacimientoContable}
                        value={formValues.fechaNacimientoContable || ''}
                        onChange={(e) => handleFieldChange('fechaNacimientoContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                    <div className={styles.grupInput}>
                        <Select
                            label="Genero"
                            id="generoContable"
                            options={[{ label: "Masculino", value: "masculino" }, { label: "Femenino", value: "femenino" }]}
                            required
                            errorMessage={errors.generoContable}
                            value={formValues.generoContable || ''}
                            onChange={(e) => handleFieldChange('generoContable', e.target.value)}
                            readOnly={isContableGerente}
                        />
                        <Input
                            label="DNI/CI"
                            type="number"
                            id="dniCiContable"
                            required
                            errorMessage={errors.dniCiContable}
                            value={formValues.dniCiContable || ''}
                            onChange={(e) => handleFieldChange('dniCiContable', e.target.value)}
                            readOnly={isContableGerente}
                        />
                    </div>
                </div>
                <div className={styles.formItem}>
                    <Combobox
                        label="Pais de Emisión DNI/CI"
                        id="paisEmisionContable"
                        options={countryOptions}
                        required
                        errorMessage={errors.paisEmisionContable}
                        value={formValues.paisEmisionContable || ''}
                        onChange={(e) => handleFieldChange('paisEmisionContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                    <div className={styles.grupInput}>
                        <Combobox
                            label="Pais de Residencia"
                            id="paisResidenciaContable"
                            options={countryOptions}
                            required
                            errorMessage={errors.paisResidenciaContable}
                            value={formValues.paisResidenciaContable || ''}
                            onChange={(e) => handleFieldChange('paisResidenciaContable', e.target.value)}
                            readOnly={isContableGerente}
                        />
                        <Combobox
                            label="Ciudad"
                            id="ciudadContable"
                            options={loadingCitiesContable ? [{ label: "Cargando...", value: "" }] : citiesContable.map(city => ({ label: city.name, value: city.id }))}
                            required
                            errorMessage={errors.ciudadContable}
                            value={formValues.ciudadContable || ''}
                            onChange={(e) => handleFieldChange('ciudadContable', e.target.value)}
                            disabled={loadingCitiesContable || isContableGerente}
                            readOnly={isContableGerente}
                        />
                        {errorCitiesContable && (
                            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                                Error al cargar ciudades: {errorCitiesContable}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Dirección"
                        type="text"
                        id="direccionContable"
                        required
                        errorMessage={errors.direccionContable}
                        value={formValues.direccionContable || ''}
                        onChange={(e) => handleFieldChange('direccionContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                    <Input
                        label="Código Postal"
                        type="number"
                        id="codigoPostalContable"
                        errorMessage={errors.codigoPostalContable}
                        value={formValues.codigoPostalContable || '0000'}
                        onChange={(e) => handleFieldChange('codigoPostalContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                </div>
                <div className={styles.formItem}>
                    <InputNumero
                        label="Celular"
                        id="telefonoContable"
                        required
                        errorMessage={errors.telefonoContable}
                        value={formValues.telefonoContable || ''}
                        onChange={(e) => handleFieldChange('telefonoContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        id="correoElectronicoContable"
                        required
                        errorMessage={errors.correoElectronicoContable === true ? "Este campo es requerido" : errors.correoElectronicoContable}
                        value={formValues.correoElectronicoContable || ''}
                        onChange={(e) => handleFieldChange('correoElectronicoContable', e.target.value)}
                        readOnly={isContableGerente}
                    />
                </div>
                
            </div>
        </div>
    );
};

export default ContactoContableForm; 