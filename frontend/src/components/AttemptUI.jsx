import React, { useState, useEffect } from 'react';
import { intentosService } from '../services/api';

export default function AttemptUI({ questions = [], lessonId }) {
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // autosave to localStorage
    const key = `attempt_${lessonId}`;
    const saved = localStorage.getItem(key);
    if (saved) setAnswers(JSON.parse(saved));
  }, [lessonId]);

  useEffect(() => {
    const key = `attempt_${lessonId}`;
    localStorage.setItem(key, JSON.stringify(answers));
  }, [answers, lessonId]);

  const handleStart = async () => {
    const alumno_id = localStorage.getItem('alumno_id');
    const res = await intentosService.startAttempt(lessonId, alumno_id);
    setAttempt(res.data.data);
  };

  const handleChange = (preguntaId, opcionId, text) => {
    setAnswers(prev => ({ ...prev, [preguntaId]: { opcion_id: opcionId, respuesta_texto: text } }));
  };

  const handleSubmit = async () => {
    if (!attempt) return alert('Inicia un intento primero');
    const payload = Object.keys(answers).map(pid => ({ pregunta_id: pid, opcion_id: answers[pid].opcion_id, respuesta_texto: answers[pid].respuesta_texto }));
    const res = await intentosService.submitAttempt(attempt.intento_id, payload);
    alert(`Intento enviado. Score: ${res.data.data.score}, progreso: ${res.data.data.progress}%`);
    // limpiar autosave
    localStorage.removeItem(`attempt_${lessonId}`);
  };

  return (
    <div>
      {!attempt && <button className="btn" onClick={handleStart}>Iniciar intento</button>}

      {questions.map(q => (
        <div key={q.pregunta_id} className="border p-3 my-2">
          <p className="font-semibold">{q.enunciado}</p>
          {/* Si hay opciones, renderizarlas */}
          {q.opciones && q.opciones.length > 0 ? (
            q.opciones.map(opt => (
              <div key={opt.opcion_id}>
                <label>
                  <input type="radio" name={`q_${q.pregunta_id}`} onChange={() => handleChange(q.pregunta_id, opt.opcion_id, null)} /> {opt.texto}
                </label>
              </div>
            ))
          ) : (
            <textarea onChange={e => handleChange(q.pregunta_id, null, e.target.value)} className="w-full p-2 border" />
          )}
        </div>
      ))}

      <div className="mt-4">
        <button className="btn btn-primary" onClick={handleSubmit}>Enviar intento</button>
      </div>
    </div>
  );
}
