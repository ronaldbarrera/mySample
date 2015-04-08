package com.fisa.render.limit.core;

import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

public class Samples {

	public static LimitView getData(){
		LimitView lv =new LimitView();
		lv.setCodePackage(""+Samples.randBetween(1, 185));
		lv.setNamePackage("Paquete de Limites y Transacciones");
		lv.setAplicaA("Empresas");
		List<CustomLevel> lc = new ArrayList<CustomLevel>();
		CustomLevel cl = new CustomLevel();
		String txt1 = Samples.randText(randBetween(20, 333));
		cl.setCode(txt1);
		cl.setName(txt1);
		lc.add(cl);
		CustomLevel cl2 = new CustomLevel();
		String txt2 = Samples.randText(randBetween(20, 333));
		cl2.setCode(txt2);
		cl2.setName(txt2);
		lc.add(cl2);
		CustomLevel cl3 = new CustomLevel();
		String txt3 = Samples.randText(randBetween(20, 333));
		cl3.setCode(txt3);
		cl3.setName(txt3);
		lc.add(cl3);
		lv.setCustonLevel(lc);
		return lv;
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
