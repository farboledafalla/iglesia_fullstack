import React, { useEffect, useState } from 'react';
import { courseService, inscripcionesService } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { useParams } from 'react-router-dom';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await courseService.getCourseById(id);
      setCourse(data);
      // intentar cargar inscripcion del alumno actual (frontend debe proveer alumno_id en contexto)
      const alumno_id = localStorage.getItem('alumno_id');
      if (alumno_id) {
        const res = await inscripcionesService.listByAlumno(alumno_id);
        const my = res.data.data.find(i => String(i.curso_id) === String(id));
        setInscripcion(my);
      }
    }
    load();
  }, [id]);

  if (!course) return <div>Cargando curso...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{course.titulo}</h1>
      <p className="mt-2">{course.descripcion}</p>

      {inscripcion && (
        <div className="mt-4">
          <h3>Progreso</h3>
          <ProgressBar percent={inscripcion.porcentaje_progreso} />
          <p className="text-sm">{inscripcion.porcentaje_progreso}%</p>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl">Módulos</h2>
        {course.modulos?.map(mod => (
          <div key={mod.modulo_id} className="mt-3 border p-3 rounded">
            <h3 className="font-semibold">{mod.titulo}</h3>
            <ul className="mt-2">
              {mod.lecciones?.map(l => (
                <li key={l.leccion_id} className="py-1">
                  <a href={`/courses/${id}/lessons/${l.leccion_id}`} className="text-blue-600">{l.titulo}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
