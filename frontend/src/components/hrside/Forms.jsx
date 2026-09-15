import { useNavigation } from '../../context/NavigationContext';
import FormManager from '../forms/FormManager';

function Forms() {
  const { goToCreateForm, goToLogin, goToFormView, goToEditForm } = useNavigation();

  return (
    <FormManager
      onCreate={goToCreateForm}
      onView={goToFormView}
      onEdit={goToEditForm}
      onUnauthorized={goToLogin}
    />
  );
}

export default Forms;