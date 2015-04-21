package com.fisa.render.quota.view.demo;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import com.fisa.render.limit.model.CustomLevel;
import com.fisa.render.limit.model.LimitView;

public class Samples {

	public static com.fisa.render.limit.model.Package getPack(){
		com.fisa.render.limit.model.Package pkg = new com.fisa.render.limit.model.Package();
		pkg.setCodePackage(""+Samples.randBetween(1, 185));
		pkg.setNamePackage("Paquete de Limites y Transacciones");
		pkg.setAplicaA("Empresas");
		pkg.setCodUsuario("001");
		pkg.setNomUsuario("Jose");
		return pkg;
	}
	
	public static List<CustomLevel> getCustomLevels(){
		List<CustomLevel> lc = new ArrayList<CustomLevel>();
		CustomLevel cl = new CustomLevel();
		cl.setCode("45");
		cl.setName("Transaccion1");
		
		CustomLevel cp = new CustomLevel();
		cp.setCode("01");
		cp.setName("Canal");
		cl.setPersonaliLevel(new ArrayList<CustomLevel>());
		cl.getPersonaliLevel().add(cp);
		
		
		CustomLevel cp2 = new CustomLevel();
		cp2.setCode("02");
		cp2.setName("Forma Pago");
		
		cl.getPersonaliLevel().add(cp2);
		
		lc.add(cl);
		
		CustomLevel cl2 = new CustomLevel();
		cl2.setCode("777");
		cl2.setName("Transaccion2");
		lc.add(cl2);
//		CustomLevel cl3 = new CustomLevel();
//		String txt3 = Samples.randText(randBetween(20, 333));
//		cl3.setCode(txt3);
//		cl3.setName(txt3);
//		lc.add(cl3);
		return lc;
	}
	
	public static List<LimitView> getData2(){
		List<LimitView> lista = new ArrayList<LimitView>();
		
		LimitView lv =new LimitView();
		lv.setCodePackage("45");
//		lv.setNamePackage("Paquete de Limites y Transacciones");
//		lv.setAplicaA("Empresas");
//		lv.setCustonLevel(lc);
		lv.setCodeLimit(""+randBetween(10, 25));
		lv.setNameLimit("Limite Diaro");
		lv.setCupoMaximo(new BigDecimal("11"));
		lv.setCupoDefecto(new BigDecimal("12"));
		lista.add(lv);
		
		LimitView lv1 =new LimitView();
		lv1.setCodePackage("45");
//		lv.setNamePackage("Paquete de Limites y Transacciones");
//		lv.setAplicaA("Empresas");
//		lv.setCustonLevel(lc);
		lv1.setCodeLimit(""+randBetween(10, 25));
		lv1.setNameLimit("Limite Diaro");
		lv1.setCupoMaximo(new BigDecimal("14"));
		lv1.setCupoDefecto(new BigDecimal("15"));
		lista.add(lv1);
		
		LimitView lv2 =new LimitView();
		lv2.setCodePackage("777");
//		lv2.setNamePackage("Paquete de Limites y Transacciones 2");
//		lv2.setAplicaA("Empresas");
		lv2.setCodeLimit(""+randBetween(10, 25));
		lv2.setNameLimit("Limite Semanal");
		lv2.setCupoMaximo(new BigDecimal("10"));
		lv2.setCupoDefecto(new BigDecimal("09"));
		lista.add(lv2);
		
		LimitView lv3 =new LimitView();
		lv3.setCodePackage("777");
//		lv3.setNamePackage("Paquete de Limites y Transacciones 3");
//		lv3.setAplicaA("Empresas");
		lv3.setCodeLimit(""+randBetween(10, 25));
		lv3.setNameLimit("Limite Mensual");
		lv3.setCupoMaximo(new BigDecimal("1000"));
		lv3.setCupoDefecto(new BigDecimal("08"));
		lista.add(lv3);
		return lista;
		
	}
	
	
	
	public static Date fechaRandom(int maxYear) {
        GregorianCalendar gc = new GregorianCalendar();
        int year = randBetween(2000, maxYear);
        gc.set(gc.YEAR, year);
        int dayOfYear = randBetween(1, gc.getActualMaximum(gc.DAY_OF_YEAR));
        gc.set(gc.DAY_OF_YEAR, dayOfYear);
        System.out.println(gc.get(gc.YEAR) + "-" + gc.get(gc.MONTH) + "-" + gc.get(gc.DAY_OF_MONTH));
        return gc.getTime();
    }

    public static int randBetween(int start, int end) {
        return start + (int)Math.round(Math.random() * (end - start));
    }
    
    public static String randText(int item){
    	while(item>5){
    		item= item-5;
    	}
    	if(item>4){item--;}
    	return Samples.ListaTipos(5).get(item);
    }
    
    public static List<String> ListaTipos(int item){
    	List<String> tipos = new ArrayList<String>(5);
    	tipos.add("Transaccion");
    	tipos.add("Pagos");
    	tipos.add("Primas");
    	tipos.add("Grupos");
    	tipos.add("Deudas");
    	return tipos;
    }
    
	public static void main(String[] args) {
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
	}
}
