import { useForm } from 'react-hook-form';
import axios from 'axios';
import './assets/css/App.css';

const FormComponent = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  interface FormData {
    firstName: string;
    surname: string;
    company: string;
    email: string;
    visiting: string;
  }
  
  
  const onSubmit = async (data:FormData) => {
    try {
      const response = await axios.post('http://localhost:3000/submit', data);
      if (response.status === 200) {
        alert('Data submitted successfully!');
      }
    } catch (error) {
      console.error('An error occurred!', error);
      alert('Failed to submit data!');
    }
  }

  return (
    <div className="FormComponent">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input 
          type="text" 
          placeholder="First Name" 
          {...register('firstName', { required: true })} 
        />
        {errors.firstName && <span>First Name is required</span>}

        <input 
          type="text" 
          placeholder="Surname" 
          {...register('surname', { required: true })} 
        />
        {errors.surname && <span>Surname is required</span>}

        <input 
          type="text" 
          placeholder="Company" 
          {...register('company', { required: true })} 
        />
        {errors.company && <span>Company is required</span>}

        <input 
          type="email" 
          placeholder="Email" 
          {...register('email', { required: true })} 
        />
        {errors.email && <span>Email is required</span>}

        <select {...register('visiting', { required: true })}>
          <option value="">Select...</option>
          <option value="Flux">Flux</option>
          <option value="CoCreate">CoCreate</option>
          <option value="Foundation">Foundation</option>
        </select>
        {errors.visiting && <span>Please select a visiting option</span>}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default FormComponent;
