import React from "react";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import argentina from "../assets/argentina.png";
import uruguay from "../assets/uruguay.png";
import spain from "../assets/spain.png";





const TerminosYCondiciones: React.FC = () => {
  const estiloTitulo = "font-bold text-[1.5em] mb-2";
  const estiloP = "mb-6 text-[1.25em]";
  const estiloArticle = "border-b-2 border-[#7ECD43] pb-2 mb-6"
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
      <p className={estiloP}>No sustituye la consulta médica presencial.</p>
      <p className={estiloP}>No prescribe tratamientos.</p>
      <p className={estiloP}>No garantiza resultados clínicos.</p>
      <p className={estiloP}>No interviene en la relación profesional entre paciente y nutricionista.</p>
      <p className="text-[1.25em]">La responsabilidad profesional recae exclusivamente en el nutricionista habilitado que presta el servicio.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>3. Registro de Usuarios</h2>
      <p className={estiloP}>Existen dos tipos de usuarios:</p>
      <p className={estiloP}>Pacientes</p>
      <p className={estiloP}>Profesionales de la nutrución</p>
      <p className="text-[1.25em]">El registro implica la aceptación expresa de los presentes Términos y Coindiciones y de la Política de Privacidad.</p>
    </article>
    <article className={estiloArticle}>
      <h2 className={estiloTitulo}>4. Condiciones para Profesionales</h2>
      <p className={estiloP}>Los profesionales que se registren deberán:</p>
      <p className={estiloP}>Contar con título habilitante en nutrición o dietética.</p>
      <p className={estiloP}>Poseer matrícula profesional vigente en su jurisdicción.</p>
      <p className={estiloP}>Declarar información veraz y actualizada.</p>
      <p className={estiloP}>El ejercicio profesional deberá cumplir con la normativa sanitaria vigente en el país de habilitación, incluyendo:</p>
      <div className="flex items-center gap-2">
        <img src={argentina} alt="" />
        <p className="text-[1.25em]">Argentina</p>
      </div>
      <p className={estiloP}>Ley 17.132 - Ejercicio de la Medicina y Profesiones Afines</p>
      <div className="flex items-center gap-2">
        <img src={uruguay} alt="" />
        <p className="text-[1.25em]">Uruguay</p>
      </div>
      <p className={estiloP}>Ley 19.286 y normativa del Ministerio de Salud Pública</p>
      <div className="flex items-center gap-2">
        <img src={spain} alt="" />
        <p className="text-[1.25em]">España</p>
      </div>
      <p className={estiloP}>Ley 44/2003 - Ordenación de la Profesiones Sanitarias</p>
      <p className="text-[1.25em]">La Plataforma podrá requerir documentación adicional para verificar la habilitación profesional.</p>
    </article>
  </AuthLayout>

  );
};

export default TerminosYCondiciones;
