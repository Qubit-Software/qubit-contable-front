import { SucursalService } from "../Services/sucursal.service";

export class ValidatorsFunctions {

    static validateIdEmpresa(): boolean {
        var sucursal: SucursalService
        if (localStorage.getItem('empresaId') == null) {
            sucursal.getSucursalInfo().subscribe(res => {
                return true;
            });
        } else {
            return true;
        }
        return false;
    }
}