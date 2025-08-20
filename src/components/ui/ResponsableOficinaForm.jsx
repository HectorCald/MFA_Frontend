import React, { useState } from 'react';
import Input from '../common/Input';
import Combobox from '../common/Combobox';
import Select from '../common/Select';
import InputNumero from '../common/InputNumero';
import CheckBox from '../common/CheckBox';
import styles from '../../pages/Cliente Empresa/agregar-cliente-empresa.module.css';
import BotonBuscar from './BotonBuscar';
import BuscarPersona from './BuscarPersona';

const ResponsableOficinaForm = ({
    formValues,
    errors,
    handleFieldChange,
    handleResponsableGerenteChange,
    isResponsableGerente,
    loadingCountries,
    errorCountries,
    countryOptions,
    citiesResponsable,
    loadingCitiesResponsable,
    errorCitiesResponsable
}) => {
    const [showBuscarPersona, setShowBuscarPersona] = useState(false);

    const handlePersonSelect = (person) => {
        // Llenar automáticamente TODOS los campos del formulario con los datos de la persona seleccionada
        
        // Datos básicos
        handleFieldChange('nombreResponsable', person.first_name || '');
        handleFieldChange('apellidoResponsable', person.last_name || '');
        
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
        handleFieldChange('fechaNacimientoResponsable', fechaFormateada);
        
        handleFieldChange('generoResponsable', person.gender === 'M' ? 'masculino' : 'femenino');
        handleFieldChange('dniCiResponsable', person.dni || '');
        
        // Ubicación y dirección
        handleFieldChange('paisEmisionResponsable', person.dni_country_id || '');
        handleFieldChange('paisResidenciaResponsable', person.country_id || '');
        handleFieldChange('ciudadResponsable', person.city_id || '');
        handleFieldChange('direccionResponsable', person.address || '');
        handleFieldChange('codigoPostalResponsable', person.postal_code || '');
        
        // Contacto
        handleFieldChange('telefonoResponsable', person.cellphone || '');
        handleFieldChange('correoElectronicoResponsable', person.email || '');
        
        console.log('Persona seleccionada para responsable:', person);
        console.log('Fecha de nacimiento original:', person.birthdate);
        console.log('Fecha de nacimiento formateada:', fechaFormateada);
        console.log('Campos llenados automáticamente');
        
        setShowBuscarPersona(false);
    };

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Responsable de Oficina</h1>
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
                        label="Usar al gerente general como responsable de oficina"
                        id="gerenteGeneralResponsable"
                        checked={isResponsableGerente}
                        onChange={handleResponsableGerenteChange}
                    />
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Nombre"
                        type="text"
                        id="nombreResponsable"
                        required
                        errorMessage={errors.nombreResponsable}
                        value={formValues.nombreResponsable || ''}
                        onChange={(e) => handleFieldChange('nombreResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                    <Input
                        label="Apellido"
                        type="text"
                        id="apellidoResponsable"
                        required
                        errorMessage={errors.apellidoResponsable}
                        value={formValues.apellidoResponsable || ''}
                        onChange={(e) => handleFieldChange('apellidoResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Fecha de Nacimiento"
                        type="date"
                        id="fechaNacimientoResponsable"
                        required
                        errorMessage={errors.fechaNacimientoResponsable}
                        value={formValues.fechaNacimientoResponsable || ''}
                        onChange={(e) => handleFieldChange('fechaNacimientoResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                    <div className={styles.grupInput}>
                        <Select
                            label="Genero"
                            id="generoResponsable"
                            options={[{ label: "Masculino", value: "masculino" }, { label: "Femenino", value: "femenino" }]}
                            required
                            errorMessage={errors.generoResponsable}
                            value={formValues.generoResponsable || ''}
                            onChange={(e) => handleFieldChange('generoResponsable', e.target.value)}
                            readOnly={isResponsableGerente}
                        />
                        <Input
                            label="DNI/CI"
                            type="number"
                            id="dniCiResponsable"
                            required
                            errorMessage={errors.dniCiResponsable}
                            value={formValues.dniCiResponsable || ''}
                            onChange={(e) => handleFieldChange('dniCiResponsable', e.target.value)}
                            readOnly={isResponsableGerente}
                        />
                    </div>
                </div>
                <div className={styles.formItem}>
                    <Combobox
                        label="Pais de Emisión DNI/CI"
                        id="paisEmisionResponsable"
                        options={countryOptions}
                        required
                        errorMessage={errors.paisEmisionResponsable}
                        value={formValues.paisEmisionResponsable || ''}
                        onChange={(e) => handleFieldChange('paisEmisionResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                    <div className={styles.grupInput}>
                        <Combobox
                            label="Pais de Residencia"
                            id="paisResidenciaResponsable"
                            options={countryOptions}
                            required
                            errorMessage={errors.paisResidenciaResponsable}
                            value={formValues.paisResidenciaResponsable || ''}
                            onChange={(e) => handleFieldChange('paisResidenciaResponsable', e.target.value)}
                            readOnly={isResponsableGerente}
                        />
                        <Combobox
                            label="Ciudad"
                            id="ciudadResponsable"
                            options={loadingCitiesResponsable ? [{ label: "Cargando...", value: "" }] : citiesResponsable.map(city => ({ label: city.name, value: city.id }))}
                            required
                            errorMessage={errors.ciudadResponsable}
                            value={formValues.ciudadResponsable || ''}
                            onChange={(e) => handleFieldChange('ciudadResponsable', e.target.value)}
                            disabled={loadingCitiesResponsable || isResponsableGerente}
                            readOnly={isResponsableGerente}
                        />
                        {errorCitiesResponsable && (
                            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                                Error al cargar ciudades: {errorCitiesResponsable}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Dirección"
                        type="text"
                        id="direccionResponsable"
                        required
                        errorMessage={errors.direccionResponsable}
                        value={formValues.direccionResponsable || ''}
                        onChange={(e) => handleFieldChange('direccionResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                    <Input
                        label="Código Postal"
                        type="number"
                        id="codigoPostalResponsable"
                        errorMessage={errors.codigoPostalResponsable}
                        value={formValues.codigoPostalResponsable || '0000'}
                        onChange={(e) => handleFieldChange('codigoPostalResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                </div>
                <div className={styles.formItem}>
                    <InputNumero
                        label="Celular"
                        id="telefonoResponsable"
                        required
                        errorMessage={errors.telefonoResponsable}
                        value={formValues.telefonoResponsable || ''}
                        onChange={(e) => handleFieldChange('telefonoResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        id="correoElectronicoResponsable"
                        required
                        errorMessage={errors.correoElectronicoResponsable === true ? "Este campo es requerido" : errors.correoElectronicoResponsable}
                        value={formValues.correoElectronicoResponsable || ''}
                        onChange={(e) => handleFieldChange('correoElectronicoResponsable', e.target.value)}
                        readOnly={isResponsableGerente}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResponsableOficinaForm; 