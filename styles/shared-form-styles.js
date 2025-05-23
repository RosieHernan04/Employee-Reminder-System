export const sharedFormStyles = `
  .card {
    border-radius: 15px;
    overflow: hidden;
    border: none;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .gradient-sidebar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #666;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .form-control {
    padding: 0.75rem 0;
    font-size: 1rem;
    background-color: transparent;
    transition: all 0.3s;
    border: none;
    border-bottom: 1px solid #dee2e6;
    border-radius: 0;
  }

  .form-control:focus {
    box-shadow: none;
    border-color: #667eea;
    background-color: transparent;
  }

  .btn-primary {
    border-radius: 25px;
    padding: 0.75rem 2.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  .btn-outline-secondary {
    border-radius: 20px;
    padding: 0.5rem 1.5rem;
    font-size: 0.875rem;
    transition: all 0.3s;
  }

  .btn-outline-secondary:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
  }

  .city-illustration {
    opacity: 0.8;
  }

  .breadcrumb {
    margin-bottom: 0;
  }

  .breadcrumb-item a {
    color: #667eea;
    text-decoration: none;
  }

  .breadcrumb-item.active {
    color: #6c757d;
  }

  select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0 center;
    background-size: 1em;
  }

  .form-wrapper {
    max-width: 800px;
    margin: 0 auto;
  }
`; 