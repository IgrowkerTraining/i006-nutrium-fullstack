import React, { useState } from "react";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import argentina from "../assets/argentina.png";
import uruguay from "../assets/uruguay.png";
import spain from "../assets/spain.png";
import { Button } from "../components/common/Button";

const TerminosYCondiciones: React.FC = () => {
  const estiloTitulo = "font-bold text-[1.5em] mb-2";
  const estiloP = "mb-6 text-[1.25em]";
  const estiloArticle = "border-b-2 border-[#7ECD43] pb-2 mb-6";
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const ambosChecked = check1 && check2;

  return (
  <AuthLayout>
    <img src={logo} alt="logo Nutrium" className="w-[50%] mx-auto my-6 block"/>
    <h1 className="text-[2em] font-bold text-center mb-6">Términos y condiciones de uso</h1>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>1. Identificación del Servicio</h2>
      <p className={estiloP}>Nutrium Platform (en adelante, “la Plataforma”) es un servicio digital que facilita la conexión entre usuarios pacientes y profesionales de la nutrición debidamente habilitados, mediante un sistema de recomendación basado en coincidencias de perfil.</p>
      <p className="text-[1.25em]">La Plataforma actúa exclusivamente como intermediario tecnológico y no presta servicios médicos ni realiza diagnósticos clínicos.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>2. Naturaleza del Servicio</h2>
      <p className={estiloP}>La Plataforma:</p>
      <ul className="pl-2">
        <li className={estiloP}>No sustituye la consulta médica presencial.</li>
        <li className={estiloP}>No prescribe tratamientos.</li>
        <li className={estiloP}>No garantiza resultados clínicos.</li>
        <li className={estiloP}>No interviene en la relación profesional entre paciente y nutricionista.</li>
      </ul>
      <p className="text-[1.25em]">La responsabilidad profesional recae exclusivamente en el nutricionista habilitado que presta el servicio.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>3. Registro de Usuarios</h2>
      <p className={estiloP}>Existen dos tipos de usuarios:</p>
      <ul className="pl-2">
        <li className={estiloP}>Pacientes</li>
        <li className={estiloP}>Profesionales de la nutrición</li>
      </ul>
      <p className="text-[1.25em]">El registro implica la aceptación expresa de los presentes Términos y Coindiciones y de la Política de Privacidad.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>4. Condiciones para Profesionales</h2>
      <p className={estiloP}>Los profesionales que se registren deberán:</p>
      <ul className="pl-2">
        <li className={estiloP}>Contar con título habilitante en nutrición o dietética.</li>
        <li className={estiloP}>Poseer matrícula profesional vigente en su jurisdicción.</li>
        <li className={estiloP}>Declarar información veraz y actualizada.</li>
      </ul>
      <p className={estiloP}>El ejercicio profesional deberá cumplir con la normativa sanitaria vigente en el país de habilitación, incluyendo:</p>
      <div className="flex items-center gap-2">
        <img src={argentina} alt="bandera argentina" />
        <p className="text-[1.25em]">Argentina</p>
      </div>
      <p className={estiloP}>Ley 17.132 - Ejercicio de la Medicina y Profesiones Afines</p>
      <div className="flex items-center gap-2">
        <img src={uruguay} alt="bandera uruguay" />
        <p className="text-[1.25em]">Uruguay</p>
      </div>
      <p className={estiloP}>Ley 19.286 y normativa del Ministerio de Salud Pública</p>
      <div className="flex items-center gap-2">
        <img src={spain} alt="bandera españa" />
        <p className="text-[1.25em]">España</p>
      </div>
      <p className={estiloP}>Ley 44/2003 - Ordenación de la Profesiones Sanitarias</p>
      <p className="text-[1.25em]">La Plataforma podrá requerir documentación adicional para verificar la habilitación profesional.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>5. Protección de Datos Personales</h2>
      <p className={estiloP}>La Plataforma trata datos personales y datos sensibles de salud conforme a la legislación aplicable en cada país:</p>
      <div className="flex items-center gap-2">
        <img src={argentina} alt="bandera argentina" />
        <p className="text-[1.25em]">Argentina</p>
      </div>
      <p className={estiloP}>Ley 25.326 - Protección de datos personales</p>
      <div className="flex items-center gap-2">
        <img src={uruguay} alt="bandera uruguay" />
        <p className="text-[1.25em]">Uruguay</p>
      </div>
      <p className={estiloP}>Ley 18.331 - Protección de Datos Personales</p>
      <div className="flex items-center gap-2">
        <img src={spain} alt="bandera españa" />
        <p className="text-[1.25em]">España</p>
      </div>
      <p className="text-[1.25em]">Reglamento (UE) 2016/679 (GDPR)</p>
      <p className={estiloP}>Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía deDerechos Digitales</p>
      <p className={estiloP}>El tratamiento de datos tiene como finalidad:</p>
      <ul className="pl-2">
        <li className={estiloP}>Gestionar el registro de usuarios.</li>
        <li className={estiloP}>Ejecutar el sistema de matchin.</li>
        <li className={estiloP}>Facilitar la comuniación profesional.</li>
        <li className={estiloP}>Gestionar la relación contractual.</li>
      </ul>
      <p className="text-[1.25em]">Los datos de salud serán tratados únicamente con consentimiento explícito del usuario.</p>
    </article>
     <article className={estiloArticle}>
      <h2 className={estiloTitulo}>6. Derechos de los Usuarios</h2>
      <p className={estiloP}>Los usuarios podrán:</p>
      <ul className="pl-2">
        <li className={estiloP}>Acceder a sus datos personales.</li>
        <li className={estiloP}>Rectificiarlos.</li>
        <li className={estiloP}>Solicitar su supresión.</li>
        <li className={estiloP}>Revocar el consentimiento otorgado.</li>
        <li className={estiloP}>Solicitar limitación del tratamiento cuando corresponda.</li>
      </ul>
      <p className="text-[1.25em]">Las solicitudes podrán realizarse a través de los canales indicados en la Plataforma.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>7. Responsabilidad de la Plataforma</h2>
      <p className={estiloP}>Nutrium Plataform no será responsable por:</p>
      <ul className="pl-2">
        <li className={estiloP}>Diagnósticos o tratamientos brindados por profesionales.</li>
        <li className={estiloP}>Resultados clínicos derivados de las consultas.</li>
        <li className={estiloP}>Conducta profesional de los nutricionistas.</li>
        <li className={estiloP}>Información incorrecta proporcionada por los usuarios.</li>
      </ul>
      <p className="text-[1.25em]">La Plataforma se limita a facilitar el contacto entre partes.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>8. Uso Adecuado</h2>
      <p className={estiloP}>Los usuarios se comprometen a:</p>
      <ul className="pl-2">
        <li className={estiloP}>Proporcionar información veraz.</li>
        <li className={estiloP}>No utilizar la Plataforma para fines ilícitos.</li>
        <li className={estiloP}>No suplantar identidad.</li>
        <li className={estiloP}>No publicar contenido ofensivo o engañoso.</li>
      </ul>
      <p className="text-[1.25em]">El incumplimiento podrá derivar en suspensión o eliminación de la cuenta.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>9. Cancelación de Cuentas</h2>
      <p className={estiloP}>Los usuarios podrán solicitar la eliminación de su cuenta en cualquier momento.</p>
      <p className="text-[1.25em]">La Plataforma podrá conservar información cuando exista obligación legal o contractual.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>10. Modificadores</h2>
      <p className={estiloP}>La Plataforma podrá modificar los presentes Términos y Condiciones.</p>
      <p className="text-[1.25em]">Las modificaciones serán notificadas y entrarán en vigencia desde su publicación.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>11. Jurisdicción y Legislación Aplicable</h2>
      <p className={estiloP}>La relación contractual se regirá por la legislación vigente en el país de residencia del usuario.</p>
      <p className="text-[1.25em]">En caso de conflicto, se aplicará la normativa local correspondiente.</p>
    </article>
    <article>
      <h2 className={estiloTitulo}>12. Aceptación Expresa</h2>
      <p className={estiloP}>Al registarse, el usuario declara:</p>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={check1}
          onChange={(e) => setCheck1(e.target.checked)}
          className="appearance-none w-6 h-6 mt-5 shrink-0 border-2 border-[#7ECD43] rounded-lg checked:bg-[#7ECD43] checked:border-[#7ECD43] cursor-pointer"
        />
        <span className={estiloP}>Haber leído y aceptado los presentes Términos y Condiciones.</span>
      </label>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={check2}
          onChange={(e) => setCheck2(e.target.checked)}
          className="appearance-none w-6 h-6 mt-9 shrink-0 border-2 border-[#7ECD43] rounded-lg checked:bg-[#7ECD43] checked:border-[#7ECD43] cursor-pointer"
        />
        <span className={estiloP}>Autorizar el tratamiento de sus datos personales y datos sensibles de salud conforme a la normativa aplicable.</span>
      </label>
      {!ambosChecked && (
          <p className={`${estiloP} text-[#FF3131]`}>Debes aceptar los términos y condiciones para poder seguir usando la aplicación.</p>
      )}
      <Button 
      variant={ambosChecked ? "primary" : "secondary"}
      disabled={!ambosChecked}
      className="w-full mt-4"
      >Continuar</Button>
    </article>
  </AuthLayout>
  );
};

export default TerminosYCondiciones;
