import React, { useState } from 'react';
import Input from '../common/Input';
import Combobox from '../common/Combobox';
import Select from '../common/Select';
import InputNumero from '../common/InputNumero';
import styles from '../../pages/Cliente Empresa/agregar-cliente-empresa.module.css';
import BotonBuscar from './BotonBuscar';
import BuscarPersona from './BuscarPersona';

const GerenteGeneralForm = ({
    formValues,
    errors,
    handleFieldChange,
    loadingCountries,
    errorCountries,
    countryOptions,
    citiesGerente,
    loadingCitiesGerente,
    errorCitiesGerente
}) => {
    const [showBuscarPersona, setShowBuscarPersona] = useState(false);

    const handlePersonSelect = (person) => {
        // Llenar automáticamente TODOS los campos del formulario con los datos de la persona seleccionada
        
        // Datos básicos
        handleFieldChange('nombreGerente', person.first_name || '');
        handleFieldChange('apellidoGerente', person.last_name || '');
        
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
        handleFieldChange('fechaNacimientoGerente', fechaFormateada);
        
        handleFieldChange('generoGerente', person.gender === 'M' ? 'masculino' : 'femenino');
        handleFieldChange('dniCiGerente', person.dni || '');
        
        // Ubicación y dirección
        handleFieldChange('paisEmisionGerente', person.dni_country_id || '');
        handleFieldChange('paisResidenciaGerente', person.country_id || '');
        handleFieldChange('ciudadGerente', person.city_id || '');
        handleFieldChange('direccionGerente', person.address || '');
        handleFieldChange('codigoPostalGerente', person.postal_code || '');
        
        // Contacto
        handleFieldChange('telefonoGerente', person.cellphone || '');
        handleFieldChange('correoElectronicoGerente', person.email || '');
    };

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Gerente General</h1>
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
                    <Input
                        label="Nombre"
                        type="text"
                        id="nombreGerente"
                        required
                        errorMessage={errors.nombreGerente}
                        value={formValues.nombreGerente || ''}
                        onChange={(e) => handleFieldChange('nombreGerente', e.target.value)}
                    />
                    <Input
                        label="Apellido"
                        type="text"
                        id="apellidoGerente"
                        required
                        errorMessage={errors.apellidoGerente}
                        value={formValues.apellidoGerente || ''}
                        onChange={(e) => handleFieldChange('apellidoGerente', e.target.value)}
                    />
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Fecha de Nacimiento"
                        type="date"
                        id="fechaNacimientoGerente"
                        required
                        errorMessage={errors.fechaNacimientoGerente}
                        value={formValues.fechaNacimientoGerente || ''}
                        onChange={(e) => handleFieldChange('fechaNacimientoGerente', e.target.value)}
                    />
                    <div className={styles.grupInput}>
                        <Select
                            label="Genero"
                            id="generoGerente"
                            options={[{ label: "Masculino", value: "masculino" }, { label: "Femenino", value: "femenino" }]}
                            required
                            errorMessage={errors.generoGerente}
                            value={formValues.generoGerente || ''}
                            onChange={(e) => handleFieldChange('generoGerente', e.target.value)}
                        />
                        <Input
                            label="DNI/CI"
                            type="number"
                            id="dniCiGerente"
                            required
                            errorMessage={errors.dniCiGerente}
                            value={formValues.dniCiGerente || ''}
                            onChange={(e) => handleFieldChange('dniCiGerente', e.target.value)}
                        />
                    </div>
                </div>
                <div className={styles.formItem}>
                    <Combobox
                        label="Pais de Emisión DNI/CI"
                        id="paisEmisionGerente"
                        options={loadingCountries ? [{ label: "", value: "" }] : countryOptions}
                        required
                        errorMessage={errors.paisEmisionGerente}
                        value={formValues.paisEmisionGerente || ''}
                        onChange={(e) => handleFieldChange('paisEmisionGerente', e.target.value)}
                    />
                    <div className={styles.grupInput}>
                        <Combobox
                            label="Pais de Residencia"
                            id="paisResidenciaGerente"
                            options={loadingCountries ? [{ label: "", value: "" }] : countryOptions}
                            required
                            errorMessage={errors.paisResidenciaGerente}
                            value={formValues.paisResidenciaGerente || ''}
                            onChange={(e) => handleFieldChange('paisResidenciaGerente', e.target.value)}
                        />
                        <Combobox
                            label="Ciudad"
                            id="ciudadGerente"
                            options={loadingCitiesGerente ? [{ label: "Selecciona", value: "" }] : citiesGerente.map(city => ({ label: city.name, value: city.id }))}
                            required
                            errorMessage={errors.ciudadGerente}
                            value={formValues.ciudadGerente || ''}
                            onChange={(e) => handleFieldChange('ciudadGerente', e.target.value)}
                            disabled={loadingCitiesGerente}
                        />
                        {errorCitiesGerente && (
                            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                                Error al cargar ciudades: {errorCitiesGerente}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.formItem}>
                    <Input
                        label="Dirección"
                        type="text"
                        id="direccionGerente"
                        required
                        errorMessage={errors.direccionGerente}
                        value={formValues.direccionGerente || ''}
                        onChange={(e) => handleFieldChange('direccionGerente', e.target.value)}
                    />
                    <Input
                        label="Código Postal"
                        type="number"
                        id="codigoPostalGerente"
                        value={formValues.codigoPostalGerente || '0000'}
                        onChange={(e) => handleFieldChange('codigoPostalGerente', e.target.value)}
                    />
                </div>
                <div className={styles.formItem}>
                    <InputNumero
                        label="Celular"
                        id="telefonoGerente"
                        required
                        errorMessage={errors.telefonoGerente}
                        value={formValues.telefonoGerente || ''}
                        onChange={(e) => handleFieldChange('telefonoGerente', e.target.value)}
                    />
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        id="correoElectronicoGerente"
                        required
                        info={"Con este correo se creara la cuenta de usuario para el gerente general."}
                        errorMessage={errors.correoElectronicoGerente === true ? "Este campo es requerido" : errors.correoElectronicoGerente}
                        value={formValues.correoElectronicoGerente || ''}
                        onChange={(e) => handleFieldChange('correoElectronicoGerente', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default GerenteGeneralForm; 